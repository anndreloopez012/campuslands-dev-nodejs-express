import http from "node:http";
import { handleRoutes } from "./routes/streetFood.routes.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  handleRoutes(req, res);
});

server.listen(PORT, () => {
  console.log(`[Street Food Native API] Servidor escuchando en http://localhost:${PORT}`);
});