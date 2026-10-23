import http from "node:http";
import { readFile } from "node:fs/promises";

const PORT = process.env.PORT || 3015;
const MENU_PATH = new URL("./data/menu.json", import.meta.url);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true, message: "API de comida urbana activa" });
    return;
  }

  if (req.method === "GET" && req.url === "/menu") {
    try {
      const raw = await readFile(MENU_PATH, "utf-8");
      sendJson(res, 200, { ok: true, data: JSON.parse(raw) });
    } catch (error) {
      sendJson(res, 500, { ok: false, message: `Error al leer el menu: ${error.message}` });
    }
    return;
  }

  sendJson(res, 404, { ok: false, message: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`Servidor comida urbana escuchando en http://localhost:${PORT}`);
});
