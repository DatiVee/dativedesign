import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises"; // Moduł do zapisywania plików

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ścieżka do naszego pliku z "bazą danych" (powstanie w folderze server)
const DB_FILE = path.join(__dirname, "reactions.json");

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // --- API DLA REAKCJI ---

  // Upewniamy się, że plik bazy danych istnieje, jak nie, to go tworzymy
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({
      "NOWA ETYKIETA, NOWA JAKOŚĆ": 2,
      "Elegancja z Nutą Natury": 4,
      "Wizytówki dla Królewskiej Marki": 3,
      "Post Reklamowy Hostingu": 1,
      "Wizytówki dla Wulkanizatora": 5,
      "Billboard z Charakterem": 6,
    }, null, 2));
  }

  // Odbieranie danych ze strony (wyświetlanie lajków)
  app.get("/api/reactions", async (req, res) => {
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.json({});
    }
  });

  // Zapisywanie nowego kliknięcia do pliku
  app.post("/api/reactions/:title", async (req, res) => {
    const { title } = req.params;
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      const reactions = JSON.parse(data);
      
      reactions[title] = (reactions[title] || 0) + 1;
      
      // Zapisujemy zaktualizowane dane do pliku
      await fs.writeFile(DB_FILE, JSON.stringify(reactions, null, 2));
      
      res.json({ success: true, count: reactions[title] });
    } catch (error) {
      res.status(500).json({ error: "Błąd serwera przy zapisie" });
    }
  });

  // -----------------------

  // Serve static files from dist/public in production
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