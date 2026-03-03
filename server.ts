import express from "express";
import { createServer as createViteServer } from "vite";
import generateHandler from "./api/generate";
import generateHtmlHandler from "./api/generate-html";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (Mocking Vercel Function behavior locally)
  app.post("/api/generate", async (req, res) => {
    // @ts-ignore
    await generateHandler(req, res);
  });

  app.post("/api/generate-html", async (req, res) => {
    // @ts-ignore
    await generateHtmlHandler(req, res);
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
