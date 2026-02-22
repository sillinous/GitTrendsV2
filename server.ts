import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint to bypass CORS
  app.post("/api/proxy-export", async (req, res) => {
    const { targetUrl, data } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: "Missing targetUrl" });
    }

    try {
      console.log(`Proxying export to: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.IMPORT_API_KEY ? { "x-api-key": process.env.IMPORT_API_KEY } : {}),
        },
        body: JSON.stringify(data),
      });

      const result = await response.text();
      
      if (response.ok) {
        res.status(200).send(result);
      } else {
        console.error(`Target responded with ${response.status}: ${result}`);
        res.status(response.status).send(result);
      }
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to reach target server" });
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
