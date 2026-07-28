import compression from "compression";
import express, { type NextFunction, type Request, type Response } from "express";
import { existsSync } from "fs";
import fs from "fs/promises";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

// Domyślnie produkcja, jeśli host nie ustawił NODE_ENV. Dzięki temu skrypt
// "start" jest cross-platform (Windows/macOS/Linux) i nie wymaga cross-env.
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Wczytujemy .env TYLKO gdy host nie dostarczył już konfiguracji maili.
// Dzięki temu zmienne środowiskowe z produkcji ZAWSZE mają pierwszeństwo
// i nie ma ryzyka nadpisania ich przez przypadkowy plik .env w buildzie.
if (!process.env.RESEND_API_KEY) {
  try {
    process.loadEnvFile?.();
  } catch {
    // brak pliku .env - lecimy dalej na zmiennych środowiskowych systemu
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prosty limiter żądań per IP+ścieżka (ochrona przed spamem formularzy).
const rateBuckets = new Map<string, { count: number; reset: number }>();
function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);

    if (!bucket || bucket.reset < now) {
      if (rateBuckets.size > 5000) rateBuckets.clear();
      rateBuckets.set(key, { count: 1, reset: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      res.status(429).json({ error: "Zbyt wiele żądań. Spróbuj za chwilę." });
      return;
    }
    next();
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function trimmedString(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max).trim() : "";
}

// Serializuje operacje read-modify-write na plikach JSON, żeby równoczesne
// żądania nie nadpisywały sobie nawzajem danych (race condition).
let fileLock: Promise<unknown> = Promise.resolve();
function withFileLock<T>(task: () => Promise<T>): Promise<T> {
  const run = fileLock.then(task, task);
  fileLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

const preferredDataDir = path.resolve(process.cwd(), "server");
const dataDir = existsSync(preferredDataDir) ? preferredDataDir : __dirname;

const REACTIONS_FILE = path.join(dataDir, "reactions.json");
const ORDERS_FILE = path.join(dataDir, "orders.json");

type DeliveryState = "pending" | "sent" | "skipped" | "failed";

type OrderRecord = {
  id: string;
  number: string;
  locale: "pl" | "en";
  status: "checkout_started" | "brief_pending" | "brief_submitted" | "ready_for_review";
  createdAt: string;
  items: unknown[];
  subtotal: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    company: string;
    taxId?: string;
    paymentMethod: string;
    notes?: string;
  };
  briefAnswers: unknown[];
  briefSubmittedAt?: string;
  delivery: {
    savedToServer: boolean;
    adminEmail: DeliveryState;
    customerEmail: DeliveryState;
    message?: string;
  };
};

type BriefAttachment = {
  name: string;
  type?: string;
  size?: number;
  content?: string;
};

type EmailConfig = {
  apiKey: string;
  fromEmail: string;
  notifyEmail: string;
};

const defaultReactions = {
  "Nowa etykieta, nowa jakość": 4,
  "Elegancja z nutą natury": 6,
  "Wizytówki dla królewskiej marki": 4,
  "Post reklamowy hostingu": 1,
  "Wizytówki dla wulkanizatora": 5,
  "Billboard z charakterem": 6,
};

async function ensureFile(filePath: string, fallback: unknown) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8");
  }
}

function createOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DD-${y}${m}${d}-${random}`;
}

async function readOrders() {
  await ensureFile(ORDERS_FILE, []);
  const raw = await fs.readFile(ORDERS_FILE, "utf-8");
  return JSON.parse(raw) as OrderRecord[];
}

async function writeOrders(orders: OrderRecord[]) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

function stripAttachmentContentFromAnswers(answers: unknown[]) {
  if (!Array.isArray(answers)) return [];

  return answers.map((rawAnswer: any) => ({
    ...rawAnswer,
    attachments: Array.isArray(rawAnswer?.attachments)
      ? rawAnswer.attachments.map((file: BriefAttachment) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        }))
      : [],
  }));
}

function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ORDER_FROM_EMAIL;
  const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL || "kontakt@dativedesign.com";

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail, notifyEmail };
}

function formatOrderItems(items: unknown[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Brak pozycji w zamówieniu.";
  }

  return items
    .map((item: any, index) => {
      const serviceName = item.serviceName || item.name || "Usługa";
      const packageName = item.packageName ? ` / ${item.packageName}` : "";
      const price = Number.isFinite(Number(item.price)) ? ` - ${Number(item.price)} zł` : "";
      const addons = Array.isArray(item.addons) && item.addons.length > 0
        ? `\n  Dodatki: ${item.addons.map((addon: any) => addon.name || addon.label || addon).join(", ")}`
        : "";

      return `${index + 1}. ${serviceName}${packageName}${price}${addons}`;
    })
    .join("\n");
}

function escapeHtml(value: unknown) {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(value: unknown) {
  const price = Number(value);
  return Number.isFinite(price) ? `${price} zł` : "-";
}

function formatFileSize(size: unknown) {
  const bytes = Number(size || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatOrderItemsHtml(items: unknown[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p style="margin:0;color:#8f8b99;">Brak pozycji w zamówieniu.</p>`;
  }

  return items
    .map((item: any, index) => {
      const serviceName = item.serviceName || item.name || "Usługa";
      const packageName = item.packageName ? ` / ${item.packageName}` : "";
      const price = Number(item.price || 0);
      const addonsTotal =
        Array.isArray(item.addons) && item.addons.length > 0
          ? item.addons.reduce((sum: number, addon: any) => sum + Number(addon.price || 0), 0)
          : 0;

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #24212c;color:#f7f2e8;font-weight:700;">
            ${index + 1}. ${escapeHtml(serviceName)}${escapeHtml(packageName)}
            ${
              Array.isArray(item.addons) && item.addons.length > 0
                ? `<div style="margin-top:6px;color:#8f8b99;font-size:13px;">Dodatki: ${escapeHtml(
                    item.addons.map((addon: any) => addon.name || addon.label || addon).join(", ")
                  )}</div>`
                : ""
            }
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #24212c;color:#d4aa3f;text-align:right;font-weight:800;white-space:nowrap;">
            ${formatPrice(price + addonsTotal)}
          </td>
        </tr>
      `;
    })
    .join("");
}

function formatBriefAnswersText(answers: unknown[]) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return "Brief nie został jeszcze uzupełniony.";
  }

  return answers
    .map((rawAnswer, index) => {
      const answer = rawAnswer as Partial<Record<string, string>>;
      return [
        `Pozycja ${index + 1}`,
        `Marka / firma: ${answer.brandName || "-"}`,
        `Cel projektu: ${answer.projectGoal || "-"}`,
        `Odbiorcy: ${answer.audience || "-"}`,
        `Klimat wizualny: ${answer.visualDirection || "-"}`,
        `Inspiracje / linki: ${answer.references || "-"}`,
        `Zakres / treści: ${answer.contentScope || "-"}`,
        `Termin: ${answer.deadline || "-"}`,
        `Dodatkowe uwagi: ${answer.additionalNotes || "-"}`,
        `Pliki: ${Array.isArray((answer as any).attachments) && (answer as any).attachments.length > 0 ? (answer as any).attachments.map((file: BriefAttachment) => file.name).join(", ") : "-"}`,
      ].join("\n");
    })
    .join("\n\n");
}

function formatBriefAnswersHtml(answers: unknown[]) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return `<p style="margin:0;color:#8f8b99;">Brief nie został jeszcze uzupełniony.</p>`;
  }

  const labels: Array<[string, string]> = [
    ["brandName", "Marka / firma"],
    ["projectGoal", "Cel projektu"],
    ["audience", "Odbiorcy"],
    ["visualDirection", "Klimat wizualny"],
    ["references", "Inspiracje / linki"],
    ["contentScope", "Zakres / treści"],
    ["deadline", "Termin"],
    ["additionalNotes", "Dodatkowe uwagi"],
  ];

  return answers
    .map((rawAnswer, index) => {
      const answer = rawAnswer as Partial<Record<string, string>>;
      const rows = labels
        .map(
          ([key, label]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #24212c;color:#8f8b99;font-size:13px;vertical-align:top;width:180px;">
                ${label}
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #24212c;color:#f7f2e8;font-size:14px;line-height:1.55;">
                ${escapeHtml(answer[key] || "-")}
              </td>
            </tr>
          `
        )
        .join("");
      const attachments = Array.isArray((answer as any).attachments)
        ? ((answer as any).attachments as BriefAttachment[])
        : [];
      const attachmentList =
        attachments.length > 0
          ? `
            <div style="margin-top:14px;padding:14px;border:1px solid rgba(212,170,63,.25);border-radius:12px;background:#14110c;">
              <div style="margin-bottom:8px;color:#d4aa3f;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                Załączniki
              </div>
              ${attachments
                .map(
                  (file) => `
                    <div style="padding:7px 0;color:#f7f2e8;font-size:14px;border-bottom:1px solid #24212c;">
                      ${escapeHtml(file.name)} <span style="color:#8f8b99;">(${escapeHtml(formatFileSize(file.size))})</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          `
          : "";

      return `
        <div style="margin-top:${index === 0 ? "0" : "18px"};padding:18px;border:1px solid #24212c;border-radius:14px;background:#100f14;">
          <div style="margin-bottom:8px;color:#d4aa3f;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
            Brief ${index + 1}
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${rows}
          </table>
          ${attachmentList}
        </div>
      `;
    })
    .join("");
}

function collectEmailAttachments(answers: unknown[]) {
  if (!Array.isArray(answers)) return [];

  return answers.flatMap((rawAnswer: any, answerIndex) => {
    if (!Array.isArray(rawAnswer?.attachments)) return [];

    return rawAnswer.attachments
      .filter((file: BriefAttachment) => file?.name && file?.content)
      .map((file: BriefAttachment, fileIndex: number) => ({
        filename: `${answerIndex + 1}-${fileIndex + 1}-${file.name}`,
        content: file.content,
      }));
  });
}

function emailShell(input: {
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  badge?: string;
  footer?: string;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#050507;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#f7f2e8;">
        <div style="max-width:720px;margin:0 auto;border:1px solid #24212c;border-radius:18px;background:#0b0a0f;overflow:hidden;">
          <div style="padding:30px 28px 24px;border-bottom:1px solid #24212c;background:linear-gradient(135deg,#14110c 0%,#0b0a0f 52%,#050507 100%);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
              <div style="color:#d4aa3f;font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">
                ${escapeHtml(input.eyebrow)}
              </div>
              ${
                input.badge
                  ? `<div style="border:1px solid rgba(212,170,63,.45);border-radius:999px;background:rgba(212,170,63,.12);padding:7px 11px;color:#f5d88a;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;">
                      ${escapeHtml(input.badge)}
                    </div>`
                  : ""
              }
            </div>
            <h1 style="margin:12px 0 0;color:#ffffff;font-size:30px;line-height:1.08;font-weight:900;letter-spacing:-0.02em;">
              ${escapeHtml(input.title)}
            </h1>
            <p style="margin:14px 0 0;color:#c8c2d1;font-size:15px;line-height:1.6;">
              ${escapeHtml(input.intro)}
            </p>
          </div>
          <div style="padding:28px;">
            ${input.content}
          </div>
          <div style="padding:18px 28px;border-top:1px solid #24212c;color:#8f8b99;font-size:12px;line-height:1.5;">
            ${escapeHtml(input.footer || "DatiVe Design - powiadomienie systemowe ze strony dativedesign.com")}
          </div>
        </div>
      </body>
    </html>
  `;
}

function contactHighlight(order: OrderRecord) {
  return `
    <div style="margin-top:18px;padding:18px;border:1px solid rgba(212,170,63,.35);border-radius:14px;background:linear-gradient(135deg,rgba(212,170,63,.16),rgba(16,15,20,.92));">
      <div style="margin-bottom:12px;color:#d4aa3f;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">
        Szybki kontakt
      </div>
      <div style="display:grid;gap:10px;">
        <a href="mailto:${escapeHtml(order.customer.email)}" style="display:block;color:#ffffff;font-size:20px;font-weight:900;text-decoration:none;">
          ${escapeHtml(order.customer.email || "-")}
        </a>
        <a href="tel:${escapeHtml(order.customer.phone)}" style="display:block;color:#f5d88a;font-size:18px;font-weight:800;text-decoration:none;">
          ${escapeHtml(order.customer.phone || "-")}
        </a>
      </div>
    </div>
  `;
}

function infoBox(title: string, description: string) {
  return `
    <div style="margin-top:18px;padding:18px;border:1px solid rgba(212,170,63,.28);border-radius:14px;background:#14110c;">
      <div style="margin-bottom:8px;color:#d4aa3f;font-size:12px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">
        ${escapeHtml(title)}
      </div>
      <p style="margin:0;color:#c8c2d1;font-size:14px;line-height:1.7;">
        ${escapeHtml(description)}
      </p>
    </div>
  `;
}

function keyValueTable(rows: Array<[string, unknown]>) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      ${rows
        .map(
          ([label, value]) => `
            <tr>
              <td style="padding:9px 0;border-bottom:1px solid #24212c;color:#8f8b99;font-size:13px;width:170px;">
                ${escapeHtml(label)}
              </td>
              <td style="padding:9px 0;border-bottom:1px solid #24212c;color:#f7f2e8;font-size:14px;font-weight:700;">
                ${escapeHtml(value || "-")}
              </td>
            </tr>
          `
        )
        .join("")}
    </table>
  `;
}

function sectionCard(title: string, content: string) {
  return `
    <div style="margin-top:18px;padding:20px;border:1px solid #24212c;border-radius:14px;background:#100f14;">
      <div style="margin-bottom:12px;color:#d4aa3f;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">
        ${escapeHtml(title)}
      </div>
      ${content}
    </div>
  `;
}

async function sendResendEmail(config: EmailConfig, input: { to: string; subject: string; text: string; html?: string; attachments?: Array<{ filename: string; content: string }> }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      attachments: input.attachments,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${body}`);
  }
}

async function sendNewOrderNotification(order: OrderRecord) {
  const config = getEmailConfig();
  if (!config) {
    return {
      adminEmail: "skipped" as DeliveryState,
      message: "Brak konfiguracji RESEND_API_KEY lub ORDER_FROM_EMAIL.",
    };
  }

  try {
    await sendResendEmail(config, {
      to: config.notifyEmail,
      subject: `Zapytanie o wycenę ${order.number} - ${order.customer.company || order.customer.name}`,
      text:
        `NOWE ZAPYTANIE O WYCENĘ\n\n` +
        `Numer zapytania: ${order.number}\n` +
        `Data: ${order.createdAt}\n` +
        `Klient: ${order.customer.name}\n` +
        `Email: ${order.customer.email}\n` +
        `Telefon: ${order.customer.phone || "-"}\n` +
        `Firma: ${order.customer.company || "-"}\n` +
        `NIP: ${order.customer.taxId || "-"}\n` +
        `Wiadomość: ${order.customer.notes || "-"}\n\n` +
        `Pozycje:\n${formatOrderItems(order.items)}\n\n` +
        `Suma wg cennika: ${order.subtotal} zł\n\n` +
        `Klient może jeszcze dosłać brief projektowy w osobnym mailu.`,
      html: emailShell({
        eyebrow: "Zapytanie o wycenę",
        title: `Zapytanie ${order.number}`,
        intro: "Klient wysłał zapytanie o wycenę przez koszyk. Jeśli uzupełni brief, przyjdzie on w osobnym mailu.",
        badge: "Do wyceny",
        content:
          contactHighlight(order) +
          infoBox(
            "Co dalej?",
            "Przejrzyj zakres, przygotuj wycenę i odpisz klientowi na maila. Jeśli dojdzie brief, będzie podpięty pod ten sam numer zapytania."
          ) +
          sectionCard(
            "Dane klienta",
            keyValueTable([
              ["Numer zapytania", order.number],
              ["Data", new Date(order.createdAt).toLocaleString("pl-PL")],
              ["Klient", order.customer.name],
              ["Email", order.customer.email],
              ["Telefon", order.customer.phone || "-"],
              ["Firma", order.customer.company || "-"],
              ["NIP", order.customer.taxId || "-"],
              ["Wiadomość", order.customer.notes || "-"],
            ])
          ) +
          sectionCard(
            "Wybrane pozycje",
            `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${formatOrderItemsHtml(
              order.items
            )}</table>`
          ) +
          `<div style="margin-top:18px;padding:18px;border-radius:14px;background:#d4aa3f;color:#050507;text-align:right;font-size:24px;font-weight:900;">
            Suma wg cennika: ${formatPrice(order.subtotal)}
          </div>`,
      }),
    });

    return { adminEmail: "sent" as DeliveryState };
  } catch (error) {
    return {
      adminEmail: "failed" as DeliveryState,
      message: `Admin email error: ${String(error)}`,
    };
  }
}

async function sendInquiryCustomerConfirmation(order: OrderRecord) {
  const config = getEmailConfig();
  if (!config || !order.customer?.email) {
    return { customerEmail: "skipped" as DeliveryState };
  }

  try {
    await sendResendEmail(config, {
      to: order.customer.email,
      subject: `Potwierdzenie zapytania ${order.number} - DatiVe Design`,
      text:
        `Dziękujemy za zapytanie o wycenę w DatiVe Design.\n\n` +
        `Numer zapytania: ${order.number}\n` +
        `Suma wg cennika: ${order.subtotal} zł\n\n` +
        `Pozycje:\n${formatOrderItems(order.items)}\n\n` +
        `Sprawdzimy zakres i odpowiemy z dopasowaną wyceną - zwykle do 24h w dni robocze.\n` +
        `To zapytanie jest bezpłatne i nie jest zobowiązaniem do zakupu.`,
      html: emailShell({
        eyebrow: "Zapytanie o wycenę",
        title: "Dziękujemy za zapytanie",
        intro:
          "Twoje zapytanie o wycenę do nas dotarło. Sprawdzimy zakres i odpowiemy z dopasowaną wyceną - zwykle do 24h w dni robocze.",
        badge: "Przyjęte",
        content:
          sectionCard(
            "Podsumowanie",
            keyValueTable([
              ["Numer zapytania", order.number],
              ["Suma wg cennika", formatPrice(order.subtotal)],
              ["Status", "Zapytanie wysłane"],
            ])
          ) +
          sectionCard(
            "Wybrane pozycje",
            `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${formatOrderItemsHtml(
              order.items
            )}</table>`
          ) +
          infoBox(
            "Bez zobowiązań",
            "Zapytanie jest bezpłatne. Ostateczną cenę i termin potwierdzamy wspólnie, zanim ruszy jakakolwiek praca."
          ),
        footer: "DatiVe Design - dziękujemy za zainteresowanie.",
      }),
    });

    return { customerEmail: "sent" as DeliveryState };
  } catch (error) {
    return {
      customerEmail: "failed" as DeliveryState,
      message: `Customer email error: ${String(error)}`,
    };
  }
}

async function sendBriefSubmittedEmails(order: OrderRecord) {
  const config = getEmailConfig();
  if (!config) {
    return {
      adminEmail: "skipped" as DeliveryState,
      customerEmail: "skipped" as DeliveryState,
      message: "Brak konfiguracji RESEND_API_KEY lub ORDER_FROM_EMAIL.",
    };
  }

  let adminEmail: DeliveryState = "failed";
  let customerEmail: DeliveryState = "failed";
  let message = "";

  try {
    const attachments = collectEmailAttachments(order.briefAnswers);

    await sendResendEmail(config, {
      to: config.notifyEmail,
      subject: `Brief do zapytania ${order.number} - ${order.customer.company || order.customer.name}`,
      text:
        `BRIEF DO ZAPYTANIA O WYCENĘ\n\n` +
        `Numer zapytania: ${order.number}\n` +
        `Klient: ${order.customer.name}\n` +
        `Email: ${order.customer.email}\n` +
        `Telefon: ${order.customer.phone}\n` +
        `Firma: ${order.customer.company}\n\n` +
        `Pozycje:\n${formatOrderItems(order.items)}\n\n` +
        `Brief:\n${formatBriefAnswersText(order.briefAnswers)}`,
      html: emailShell({
        eyebrow: "Brief do zapytania",
        title: `Brief ${order.number}`,
        intro: "Klient uzupełnił brief projektowy do swojego zapytania o wycenę.",
        badge: "Brief wysłany",
        content:
          contactHighlight(order) +
          infoBox(
            "Co dalej?",
            "Ten mail zawiera komplet informacji z briefu. Możesz doprecyzować wycenę, potwierdzić termin i odpisać klientowi."
          ) +
          sectionCard(
            "Dane klienta",
            keyValueTable([
              ["Numer zapytania", order.number],
              ["Klient", order.customer.name],
              ["Email", order.customer.email],
              ["Telefon", order.customer.phone],
              ["Firma", order.customer.company],
            ])
          ) +
          sectionCard(
            "Pozycje zamówienia",
            `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${formatOrderItemsHtml(
              order.items
            )}</table>`
          ) +
          sectionCard("Brief projektowy", formatBriefAnswersHtml(order.briefAnswers)),
      }),
      attachments,
    });
    adminEmail = "sent";
  } catch (error) {
    adminEmail = "failed";
    message = `Admin email error: ${String(error)}`;
  }

  try {
    await sendResendEmail(config, {
      to: order.customer.email,
      subject: `Brief przyjęty - zapytanie ${order.number}`,
      text:
        `Dziękujemy za uzupełnienie briefu w DatiVe Design.\n\n` +
        `Numer zapytania: ${order.number}\n` +
        `Suma wg cennika: ${order.subtotal} zł\n` +
        `Status: zapytanie + brief wysłane.\n\n` +
        `Na tej podstawie przygotujemy dopasowaną wycenę i odpowiemy mailem - zwykle do 24h w dni robocze.`,
      html: emailShell({
        eyebrow: "Brief przyjęty",
        title: "Dziękujemy za przesłanie briefu",
        intro:
          "Twoje zapytanie i brief projektowy do nas dotarły. Na tej podstawie przygotujemy dopasowaną wycenę i odpowiemy mailem.",
        badge: "Przyjęte",
        content:
          sectionCard(
            "Podsumowanie",
            keyValueTable([
              ["Numer zapytania", order.number],
              ["Suma wg cennika", formatPrice(order.subtotal)],
              ["Status", "Zapytanie + brief wysłane"],
            ])
          ) +
          sectionCard(
            "Co dalej?",
            `<p style="margin:0;color:#c8c2d1;font-size:15px;line-height:1.7;">
              Przejrzymy przesłane informacje, przygotujemy wycenę i odezwiemy się z dalszymi krokami - zwykle do 24h w dni robocze.
            </p>`
          ),
        footer: "DatiVe Design - dziękujemy za zaufanie.",
      }),
    });
    customerEmail = "sent";
  } catch (error) {
    customerEmail = "failed";
    if (!message) {
      message = `Customer email error: ${String(error)}`;
    }
  }

  return { adminEmail, customerEmail, message };
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(compression());
  app.use(express.json({ limit: "35mb" }));
  await ensureFile(REACTIONS_FILE, defaultReactions);
  await ensureFile(ORDERS_FILE, []);

  if (!getEmailConfig()) {
    console.warn(
      "[DatiVe] Brak konfiguracji maili (RESEND_API_KEY / ORDER_FROM_EMAIL). " +
        "Zamówienia będą zapisywane, ale powiadomienia e-mail NIE zostaną wysłane. " +
        "Uzupełnij zmienne środowiskowe wg .env.example.",
    );
  }

  app.get("/api/reactions", async (_req, res) => {
    try {
      const data = await fs.readFile(REACTIONS_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      console.error("Nie udało się odczytać reakcji:", error);
      res.json({});
    }
  });

  app.post("/api/reactions/:title", rateLimit(30, 60_000), async (req, res) => {
    const { title } = req.params;

    try {
      const count = await withFileLock(async () => {
        const data = await fs.readFile(REACTIONS_FILE, "utf-8");
        const reactions = JSON.parse(data);

        // tylko istniejące pozycje - bez tworzenia dowolnych kluczy z URL-a
        if (!Object.prototype.hasOwnProperty.call(reactions, title)) {
          return null;
        }

        reactions[title] = (reactions[title] || 0) + 1;
        await fs.writeFile(REACTIONS_FILE, JSON.stringify(reactions, null, 2), "utf-8");

        return reactions[title] as number;
      });

      if (count === null) {
        res.status(404).json({ error: "Nieznana pozycja." });
        return;
      }

      res.json({ success: true, count });
    } catch (error) {
      console.error("Nie udało się zapisać reakcji:", error);
      res.status(500).json({ error: "Błąd serwera przy zapisie reakcji." });
    }
  });

  app.post("/api/orders", rateLimit(10, 10 * 60_000), async (req, res) => {
    try {
      const payload = req.body;

      // Walidacja wejścia - przyjmujemy tylko sensowne zapytania
      const rawCustomer = payload?.customer;
      const name = trimmedString(rawCustomer?.name, 120);
      const email = trimmedString(rawCustomer?.email, 160);
      const items = Array.isArray(payload?.items) ? payload.items.slice(0, 30) : [];

      if (!name || !EMAIL_RE.test(email)) {
        res.status(400).json({ error: "Podaj poprawne imię i adres e-mail." });
        return;
      }
      if (items.length === 0) {
        res.status(400).json({ error: "Zapytanie nie zawiera żadnych pozycji." });
        return;
      }

      const order: OrderRecord = {
        id: randomUUID(),
        number: createOrderNumber(),
        locale: payload?.locale === "en" ? "en" : "pl",
        status: "brief_pending",
        createdAt: new Date().toISOString(),
        items,
        subtotal: Number.isFinite(Number(payload?.subtotal)) ? Number(payload.subtotal) : 0,
        customer: {
          name,
          email,
          phone: trimmedString(rawCustomer?.phone, 40),
          company: trimmedString(rawCustomer?.company, 160),
          taxId: trimmedString(rawCustomer?.taxId, 32),
          paymentMethod: trimmedString(rawCustomer?.paymentMethod, 60),
          notes: trimmedString(rawCustomer?.notes, 2000),
        },
        briefAnswers: [],
        delivery: {
          savedToServer: true,
          adminEmail: "pending",
          customerEmail: "pending",
        },
      };

      const adminState = await sendNewOrderNotification(order);
      const customerState = await sendInquiryCustomerConfirmation(order);
      order.delivery = {
        ...order.delivery,
        adminEmail: adminState.adminEmail,
        customerEmail: customerState.customerEmail,
        message: adminState.message || customerState.message,
      };

      await withFileLock(async () => {
        const orders = await readOrders();
        await writeOrders([order, ...orders]);
      });
      res.json(order);
    } catch (error) {
      console.error("Nie udało się zapisać zamówienia:", error);
      res.status(500).json({ error: "Błąd serwera przy zapisie zamówienia." });
    }
  });

  app.patch("/api/orders/:id/brief", rateLimit(10, 10 * 60_000), async (req, res) => {
    const { id } = req.params;

    try {
      const orders = await readOrders();
      const index = orders.findIndex((order) => order.id === id);

      if (index === -1) {
        res.status(404).json({ error: "Nie znaleziono zamówienia." });
        return;
      }

      const updatedOrder: OrderRecord = {
        ...orders[index],
        status: "brief_submitted",
        briefAnswers: req.body?.answers ?? [],
        briefSubmittedAt: new Date().toISOString(),
      };

      // Maile wysyłamy z pełnymi (base64) załącznikami, jeszcze przed obcięciem.
      const emailState = await sendBriefSubmittedEmails(updatedOrder);
      updatedOrder.delivery = {
        savedToServer: true,
        adminEmail: emailState.adminEmail,
        customerEmail: emailState.customerEmail,
        message: emailState.message,
      };

      // Na dysku nie trzymamy base64 załączników - tylko metadane.
      updatedOrder.briefAnswers = stripAttachmentContentFromAnswers(updatedOrder.briefAnswers);

      await withFileLock(async () => {
        const current = await readOrders();
        const currentIndex = current.findIndex((order) => order.id === id);
        if (currentIndex === -1) {
          current.unshift(updatedOrder);
        } else {
          current[currentIndex] = updatedOrder;
        }
        await writeOrders(current);
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Nie udało się zapisać briefu:", error);
      res.status(500).json({ error: "Błąd serwera przy zapisie briefu." });
    }
  });

  app.get("/api/orders/:id", rateLimit(60, 60_000), async (req, res) => {
    try {
      const orders = await readOrders();
      const order = orders.find((entry) => entry.id === req.params.id);

      if (!order) {
        res.status(404).json({ error: "Nie znaleziono zamówienia." });
        return;
      }

      res.json(order);
    } catch (error) {
      console.error("Nie udało się odczytać zamówienia:", error);
      res.status(500).json({ error: "Błąd serwera przy odczycie zamówienia." });
    }
  });

  // Nieznane trasy /api/* dostają 404 JSON, a nie index.html ze statusem 200.
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Nie znaleziono zasobu API." });
  });

  // Wybieramy katalog ze zbudowanym frontem po tym, co realnie istnieje na dysku,
  // zamiast polegać wyłącznie na NODE_ENV (odporne na różne układy build/deploy).
  const staticCandidates = [
    path.resolve(__dirname, "public"),
    path.resolve(__dirname, "..", "dist", "public"),
  ];
  const staticPath = staticCandidates.find((candidate) => existsSync(candidate)) ?? staticCandidates[0];

  app.use(
    express.static(staticPath, {
      setHeaders(res, filePath) {
        // Hashowane assety Vite - cache na rok; reszta (obrazki itd.) - doba.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (/\.(jpe?g|png|webp|avif|svg|ico|woff2?)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      },
    })
  );

  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Globalna siatka bezpieczeństwa - błąd w handlerze nie zabija procesu.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Nieobsłużony błąd żądania:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Błąd serwera." });
    }
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("uncaughtException:", error);
});

startServer().catch(console.error);
