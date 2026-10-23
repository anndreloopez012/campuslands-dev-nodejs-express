const http = require("node:http");

const servidor = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Servidor nativo funcionando");
});

servidor.listen(3000, () => {
  console.log("=== Ejercicio 15: API HTTP nativa ===");
  console.log("Servidor en http://localhost:3000");
});
