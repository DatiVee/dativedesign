import express from "express";
import fs from "fs/promises";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "reactions.json");

const defaultReactions = {
  "Nowa etykieta, nowa jakość": 4,
  "Elegancja z nutą natury": 6,
  "Wizytówki dla królewskiej marki": 4,
  "Post reklamowy hostingu": 1,
  "Wizytówki dla wulkanizatora": 5,
  "Billboard z charakterem": 6,
};

async function ensureReactionsFile() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(defaultReactions, null, 2), "utf-8");
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());
  await ensureReactionsFile();

  app.get("/api/reactions", async (_req, res) => {
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      console.error("Nie udało się odczytać reakcji:", error);
      res.json({});
    }
  });

  app.post("/api/reactions/:title", async (req, res) => {
    const { title } = req.params;

    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      const reactions = JSON.parse(data);

      reactions[title] = (reactions[title] || 0) + 1;
      await fs.writeFile(DB_FILE, JSON.stringify(reactions, null, 2), "utf-8");

      res.json({ success: true, count: reactions[title] });
    } catch (error) {
      console.error("Nie udało się zapisać reakcji:", error);
      res.status(500).json({ error: "Błąd serwera przy zapisie reakcji." });
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
