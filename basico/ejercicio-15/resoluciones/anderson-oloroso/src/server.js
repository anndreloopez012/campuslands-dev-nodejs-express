import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3015;

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const server = createServer(async (req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/health") {
    return sendJSON(res, 200, { ok: true, topic: "mini API HTTP nativa" });
  }

  if (method === "GET" && url === "/menu") {
    try {
      const filePath = join(__dirname, "data", "menu.json");
      const raw = await readFile(filePath, "utf-8");
      return sendJSON(res, 200, JSON.parse(raw));
    } catch (err) {
      return sendJSON(res, 500, { error: "No se pudo leer el menú" });
    }
  }

  sendJSON(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`🌮 Servidor comida urbana corriendo en http://localhost:${PORT}`);
});
