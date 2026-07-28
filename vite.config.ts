import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

// Wczytujemy .env do process.env (dev API: zamówienia, maile) - tylko gdy
// host nie ustawił już klucza, żeby zmienne z systemu miały pierwszeństwo.
if (!process.env.RESEND_API_KEY) {
  try {
    process.loadEnvFile?.();
  } catch {
    // brak .env - dev API po prostu pominie wysyłkę maili
  }
}

const PROJECT_ROOT = import.meta.dirname;
const REACTIONS_FILE = path.join(PROJECT_ROOT, "reactions.json");
const DEV_ORDERS_FILE = path.join(PROJECT_ROOT, "server", "orders.json");

type DevOrderStatus = "checkout_started" | "brief_pending" | "brief_submitted" | "ready_for_review";
type DevDeliveryState = "pending" | "sent" | "skipped" | "failed";

type DevOrderRecord = {
  id: string;
  number: string;
  locale: "pl" | "en";
  status: DevOrderStatus;
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
    adminEmail: DevDeliveryState;
    customerEmail: DevDeliveryState;
    message?: string;
  };
};

type EmailConfig = {
  apiKey: string;
  fromEmail: string;
  notifyEmail: string;
};

function readJsonBody(req: IncomingMessage) {
  return new Promise<any>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function ensureJsonFile(filePath: string, fallback: unknown) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
  }
}

function vitePluginReactionsAPI(): Plugin {
  ensureJsonFile(REACTIONS_FILE, {
    "Nowa etykieta, nowa jakość": 2,
    "Elegancja z nutą natury": 4,
    "Wizytówki dla królewskiej marki": 3,
    "Post reklamowy hostingu": 1,
    "Wizytówki dla wulkanizatora": 5,
    "Billboard z charakterem": 6,
  });

  return {
    name: "reactions-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/reactions" && req.method === "GET") {
          try {
            const data = fs.readFileSync(REACTIONS_FILE, "utf-8");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(data);
          } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Błąd odczytu bazy" }));
          }
          return;
        }

        if (req.url?.startsWith("/api/reactions/") && req.method === "POST") {
          const title = decodeURIComponent(req.url.replace("/api/reactions/", ""));

          try {
            const reactions = JSON.parse(fs.readFileSync(REACTIONS_FILE, "utf-8"));
            reactions[title] = (reactions[title] || 0) + 1;
            fs.writeFileSync(REACTIONS_FILE, JSON.stringify(reactions, null, 2), "utf-8");

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, count: reactions[title] }));
          } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Błąd zapisu bazy" }));
          }
          return;
        }

        next();
      });
    },
  };
}

function ensureOrdersFile() {
  ensureJsonFile(DEV_ORDERS_FILE, []);
}

function readOrdersFile(): DevOrderRecord[] {
  ensureOrdersFile();
  return JSON.parse(fs.readFileSync(DEV_ORDERS_FILE, "utf-8")) as DevOrderRecord[];
}

function writeOrdersFile(orders: DevOrderRecord[]) {
  fs.writeFileSync(DEV_ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

function createDevOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DD-${y}${m}${d}-${random}`;
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

function formatDevOrderItems(items: unknown[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Brak pozycji w zamówieniu.";
  }

  return items
    .map((item: any, index) => {
      const serviceName = item.serviceName || item.name || "Usługa";
      const packageName = item.packageName ? ` / ${item.packageName}` : "";
      const price = Number.isFinite(Number(item.price)) ? ` - ${Number(item.price)} zł` : "";
      const addons =
        Array.isArray(item.addons) && item.addons.length > 0
          ? `\n  Dodatki: ${item.addons.map((addon: any) => addon.name || addon.label || addon).join(", ")}`
          : "";

      return `${index + 1}. ${serviceName}${packageName}${price}${addons}`;
    })
    .join("\n");
}

function formatDevBriefAnswers(answers: unknown[]) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return "Brief nie został jeszcze uzupełniony.";
  }

  return JSON.stringify(answers, null, 2);
}

async function sendDevResendEmail(config: EmailConfig, input: { to: string; subject: string; text: string }) {
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
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${body}`);
  }
}

async function sendDevNewOrderNotification(order: DevOrderRecord) {
  const config = getEmailConfig();
  if (!config) {
    return {
      adminEmail: "skipped" as DevDeliveryState,
      message: "Brak konfiguracji RESEND_API_KEY lub ORDER_FROM_EMAIL.",
    };
  }

  try {
    await sendDevResendEmail(config, {
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
        `Pozycje:\n${formatDevOrderItems(order.items)}\n\n` +
        `Suma wg cennika: ${order.subtotal} zł\n\n` +
        `Klient może jeszcze dosłać brief projektowy w osobnym mailu.`,
    });

    return { adminEmail: "sent" as DevDeliveryState };
  } catch (error) {
    return {
      adminEmail: "failed" as DevDeliveryState,
      message: `Admin email error: ${String(error)}`,
    };
  }
}

async function sendDevBriefSubmittedEmails(order: DevOrderRecord) {
  const config = getEmailConfig();
  if (!config) {
    return {
      adminEmail: "skipped" as DevDeliveryState,
      customerEmail: "skipped" as DevDeliveryState,
      message: "Brak konfiguracji RESEND_API_KEY lub ORDER_FROM_EMAIL.",
    };
  }

  let adminEmail: DevDeliveryState = "failed";
  let customerEmail: DevDeliveryState = "failed";
  let message = "";

  try {
    await sendDevResendEmail(config, {
      to: config.notifyEmail,
      subject: `Brief do zapytania ${order.number} - ${order.customer.company || order.customer.name}`,
      text:
        `BRIEF DO ZAPYTANIA O WYCENĘ\n\n` +
        `Numer zapytania: ${order.number}\n` +
        `Klient: ${order.customer.name}\n` +
        `Email: ${order.customer.email}\n` +
        `Telefon: ${order.customer.phone}\n` +
        `Firma: ${order.customer.company}\n\n` +
        `Pozycje:\n${formatDevOrderItems(order.items)}\n\n` +
        `Brief:\n${formatDevBriefAnswers(order.briefAnswers)}`,
    });
    adminEmail = "sent";
  } catch (error) {
    adminEmail = "failed";
    message = `Admin email error: ${String(error)}`;
  }

  try {
    await sendDevResendEmail(config, {
      to: order.customer.email,
      subject: `Brief przyjęty - zapytanie ${order.number}`,
      text:
        `Dziękujemy za uzupełnienie briefu w DatiVe Design.\n\n` +
        `Numer zapytania: ${order.number}\n` +
        `Suma wg cennika: ${order.subtotal} zł\n` +
        `Status: zapytanie + brief wysłane.\n\n` +
        `Na tej podstawie przygotujemy dopasowaną wycenę i odpowiemy mailem - zwykle do 24h w dni robocze.`,
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

function vitePluginOrdersAPI(): Plugin {
  ensureOrdersFile();

  return {
    name: "orders-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/orders" && req.method === "POST") {
          try {
            const payload = await readJsonBody(req);
            const orders = readOrdersFile();
            const order: DevOrderRecord = {
              id: randomUUID(),
              number: createDevOrderNumber(),
              locale: payload.locale === "en" ? "en" : "pl",
              status: "brief_pending",
              createdAt: new Date().toISOString(),
              items: payload.items ?? [],
              subtotal: Number(payload.subtotal ?? 0),
              customer: payload.customer,
              briefAnswers: [],
              delivery: {
                savedToServer: true,
                adminEmail: "pending",
                customerEmail: "pending",
              },
            };

            const emailState = await sendDevNewOrderNotification(order);
            let customerEmail: DevDeliveryState = "skipped";
            const customerConfig = getEmailConfig();
            if (customerConfig && order.customer?.email) {
              try {
                await sendDevResendEmail(customerConfig, {
                  to: order.customer.email,
                  subject: `Potwierdzenie zapytania ${order.number} - DatiVe Design`,
                  text:
                    `Dziękujemy za zapytanie o wycenę w DatiVe Design.\n\n` +
                    `Numer zapytania: ${order.number}\n` +
                    `Suma wg cennika: ${order.subtotal} zł\n\n` +
                    `Pozycje:\n${formatDevOrderItems(order.items)}\n\n` +
                    `Sprawdzimy zakres i odpowiemy z dopasowaną wyceną - zwykle do 24h w dni robocze.`,
                });
                customerEmail = "sent";
              } catch {
                customerEmail = "failed";
              }
            }
            order.delivery = {
              ...order.delivery,
              adminEmail: emailState.adminEmail,
              customerEmail,
              message: emailState.message,
            };

            writeOrdersFile([order, ...orders]);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(order));
          } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Błąd zapisu zamówienia" }));
          }
          return;
        }

        if (req.url?.startsWith("/api/orders/") && req.url.endsWith("/brief") && req.method === "PATCH") {
          try {
            const orderId = req.url.split("/")[3];
            const payload = await readJsonBody(req);
            const orders = readOrdersFile();
            const index = orders.findIndex((order) => order.id === orderId);

            if (index === -1) {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Nie znaleziono zamówienia" }));
              return;
            }

            const updatedOrder: DevOrderRecord = {
              ...orders[index],
              status: "brief_submitted",
              briefAnswers: payload.answers ?? [],
              briefSubmittedAt: new Date().toISOString(),
            };

            const emailState = await sendDevBriefSubmittedEmails(updatedOrder);
            updatedOrder.delivery = {
              savedToServer: true,
              adminEmail: emailState.adminEmail,
              customerEmail: emailState.customerEmail,
              message: emailState.message,
            };

            // Jak na produkcji: na dysku tylko metadane załączników, bez base64.
            updatedOrder.briefAnswers = (updatedOrder.briefAnswers as any[]).map((answer: any) => ({
              ...answer,
              attachments: Array.isArray(answer?.attachments)
                ? answer.attachments.map((file: any) => ({
                    name: file?.name,
                    type: file?.type,
                    size: file?.size,
                  }))
                : [],
            }));

            orders[index] = updatedOrder;
            writeOrdersFile(orders);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(updatedOrder));
          } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Błąd zapisu briefu" }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vitePluginReactionsAPI(), vitePluginOrdersAPI()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Dokładne dopasowanie ścieżek - "react" jako substring łapałby też
          // lucide-react, @radix-ui/react-* itd. i wsysał wszystko do jednego chunka.
          if (
            /node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
          ) {
            return "react-vendor";
          }
          if (id.includes("lucide-react")) return "icons";
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
