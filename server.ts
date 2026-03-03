import express from "express";
import { createServer as createViteServer } from "vite";
import { generateWebsiteContent } from "./api/generate";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate", async (req, res) => {
    try {
      const data = req.body;
      const content = await generateWebsiteContent(data);
      res.json(content);
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  app.post("/api/generate-html", async (req, res) => {
    try {
      const { generateFullHTML } = await import("./api/generate");
      const data = req.body;
      const html = await generateFullHTML(data);
      res.json({ html });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to generate HTML" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
