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

function formatBriefAnswers(answers: unknown[]) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return "Brief nie został jeszcze uzupełniony.";
  }

  return JSON.stringify(answers, null, 2);
}

async function sendResendEmail(config: EmailConfig, input: { to: string; subject: string; text: string }) {
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
        `Brief:\n${formatBriefAnswers(order.briefAnswers)}`,
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
