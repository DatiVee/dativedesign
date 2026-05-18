import express from "express";
import { existsSync } from "fs";
import fs from "fs/promises";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      return `
        <div style="margin-top:${index === 0 ? "0" : "18px"};padding:18px;border:1px solid #24212c;border-radius:14px;background:#100f14;">
          <div style="margin-bottom:8px;color:#d4aa3f;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
            Brief ${index + 1}
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${rows}
          </table>
        </div>
      `;
    })
    .join("");
}

function emailShell(input: {
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  footer?: string;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#050507;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#f7f2e8;">
        <div style="max-width:720px;margin:0 auto;border:1px solid #24212c;border-radius:18px;background:#0b0a0f;overflow:hidden;">
          <div style="padding:30px 28px 24px;border-bottom:1px solid #24212c;background:linear-gradient(135deg,#14110c 0%,#0b0a0f 52%,#050507 100%);">
            <div style="color:#d4aa3f;font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">
              ${escapeHtml(input.eyebrow)}
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

async function sendResendEmail(config: EmailConfig, input: { to: string; subject: string; text: string; html?: string }) {
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
      subject: `Nowe zamówienie ${order.number} - ${order.customer.company || order.customer.name}`,
      text:
        `NOWE ZAMÓWIENIE - CHECKOUT\n\n` +
        `Numer zamówienia: ${order.number}\n` +
        `Data: ${order.createdAt}\n` +
        `Klient: ${order.customer.name}\n` +
        `Email: ${order.customer.email}\n` +
        `Telefon: ${order.customer.phone}\n` +
        `Firma: ${order.customer.company}\n` +
        `NIP: ${order.customer.taxId || "-"}\n` +
        `Płatność: ${order.customer.paymentMethod}\n` +
        `Notatki: ${order.customer.notes || "-"}\n\n` +
        `Pozycje:\n${formatOrderItems(order.items)}\n\n` +
        `Łącznie: ${order.subtotal} zł\n\n` +
        `Brief zostanie dosłany po kolejnym kroku formularza.`,
      html: emailShell({
        eyebrow: "Nowe zamówienie",
        title: `Zamówienie ${order.number}`,
        intro: "Klient przeszedł checkout. Brief projektowy powinien przyjść w kolejnym mailu po uzupełnieniu formularza.",
        content:
          sectionCard(
            "Dane klienta",
            keyValueTable([
              ["Numer zamówienia", order.number],
              ["Data", new Date(order.createdAt).toLocaleString("pl-PL")],
              ["Klient", order.customer.name],
              ["Email", order.customer.email],
              ["Telefon", order.customer.phone],
              ["Firma", order.customer.company],
              ["NIP", order.customer.taxId || "-"],
              ["Płatność", order.customer.paymentMethod],
              ["Notatki", order.customer.notes || "-"],
            ])
          ) +
          sectionCard(
            "Pozycje zamówienia",
            `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${formatOrderItemsHtml(
              order.items
            )}</table>`
          ) +
          `<div style="margin-top:18px;padding:18px;border-radius:14px;background:#d4aa3f;color:#050507;text-align:right;font-size:24px;font-weight:900;">
            Łącznie: ${formatPrice(order.subtotal)}
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
    await sendResendEmail(config, {
      to: config.notifyEmail,
      subject: `Brief do zamówienia ${order.number} - ${order.customer.company || order.customer.name}`,
      text:
        `BRIEF DO ZAMÓWIENIA\n\n` +
        `Numer zamówienia: ${order.number}\n` +
        `Klient: ${order.customer.name}\n` +
        `Email: ${order.customer.email}\n` +
        `Telefon: ${order.customer.phone}\n` +
        `Firma: ${order.customer.company}\n\n` +
        `Pozycje:\n${formatOrderItems(order.items)}\n\n` +
        `Brief:\n${formatBriefAnswersText(order.briefAnswers)}`,
      html: emailShell({
        eyebrow: "Brief do zamówienia",
        title: `Brief ${order.number}`,
        intro: "Klient uzupełnił dane potrzebne do rozpoczęcia realizacji projektu.",
        content:
          sectionCard(
            "Dane klienta",
            keyValueTable([
              ["Numer zamówienia", order.number],
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
    });
    adminEmail = "sent";
  } catch (error) {
    adminEmail = "failed";
    message = `Admin email error: ${String(error)}`;
  }

  try {
    await sendResendEmail(config, {
      to: order.customer.email,
      subject: `Potwierdzenie zamówienia ${order.number}`,
      text:
        `Dziękujemy za zamówienie w DatiVe Design.\n\n` +
        `Numer zamówienia: ${order.number}\n` +
        `Kwota: ${order.subtotal} zł\n` +
        `Status: brief wysłany.\n\n` +
        `Skontaktujemy się po weryfikacji briefu i potwierdzeniu zakresu realizacji.`,
      html: emailShell({
        eyebrow: "Potwierdzenie zamówienia",
        title: "Dziękujemy za przesłanie briefu",
        intro: "Twoje zamówienie i brief projektowy zostały zapisane. Kolejny krok to weryfikacja zakresu i kontakt w sprawie realizacji.",
        content:
          sectionCard(
            "Podsumowanie",
            keyValueTable([
              ["Numer zamówienia", order.number],
              ["Kwota", formatPrice(order.subtotal)],
              ["Status", "Brief wysłany"],
            ])
          ) +
          sectionCard(
            "Co dalej?",
            `<p style="margin:0;color:#c8c2d1;font-size:15px;line-height:1.7;">
              Przejrzę przesłane informacje, sprawdzę zakres projektu i odezwę się z potwierdzeniem dalszych kroków.
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

  app.use(express.json());
  await ensureFile(REACTIONS_FILE, defaultReactions);
  await ensureFile(ORDERS_FILE, []);

  app.get("/api/reactions", async (_req, res) => {
    try {
      const data = await fs.readFile(REACTIONS_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      console.error("Nie udało się odczytać reakcji:", error);
      res.json({});
    }
  });

  app.post("/api/reactions/:title", async (req, res) => {
    const { title } = req.params;

    try {
      const data = await fs.readFile(REACTIONS_FILE, "utf-8");
      const reactions = JSON.parse(data);

      reactions[title] = (reactions[title] || 0) + 1;
      await fs.writeFile(REACTIONS_FILE, JSON.stringify(reactions, null, 2), "utf-8");

      res.json({ success: true, count: reactions[title] });
    } catch (error) {
      console.error("Nie udało się zapisać reakcji:", error);
      res.status(500).json({ error: "Błąd serwera przy zapisie reakcji." });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orders = await readOrders();
      const payload = req.body;

      const order: OrderRecord = {
        id: randomUUID(),
        number: createOrderNumber(),
        locale: payload?.locale === "en" ? "en" : "pl",
        status: "brief_pending",
        createdAt: new Date().toISOString(),
        items: payload?.items ?? [],
        subtotal: Number(payload?.subtotal ?? 0),
        customer: payload?.customer,
        briefAnswers: [],
        delivery: {
          savedToServer: true,
          adminEmail: "pending",
          customerEmail: "pending",
        },
      };

      const emailState = await sendNewOrderNotification(order);
      order.delivery = {
        ...order.delivery,
        adminEmail: emailState.adminEmail,
        message: emailState.message,
      };

      await writeOrders([order, ...orders]);
      res.json(order);
    } catch (error) {
      console.error("Nie udało się zapisać zamówienia:", error);
      res.status(500).json({ error: "Błąd serwera przy zapisie zamówienia." });
    }
  });

  app.patch("/api/orders/:id/brief", async (req, res) => {
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

      const emailState = await sendBriefSubmittedEmails(updatedOrder);
      updatedOrder.delivery = {
        savedToServer: true,
        adminEmail: emailState.adminEmail,
        customerEmail: emailState.customerEmail,
        message: emailState.message,
      };

      orders[index] = updatedOrder;
      await writeOrders(orders);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Nie udało się zapisać briefu:", error);
      res.status(500).json({ error: "Błąd serwera przy zapisie briefu." });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
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

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
