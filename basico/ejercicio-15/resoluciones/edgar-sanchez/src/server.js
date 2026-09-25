import http from "node:http";
import app from "./app.js";

const DEFAULT_PORT = 3015;

function getPort(value) {
  const port = value === undefined ? DEFAULT_PORT : Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535");
  }

  return port;
}

let port;

try {
  port = getPort(process.env.PORT);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const server = http.createServer(app);

server.on("error", (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, () => {
  console.log(`API de comida urbana: http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} recibido, cerrando el servidor...`);
  server.close(() => process.exit(0));
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));