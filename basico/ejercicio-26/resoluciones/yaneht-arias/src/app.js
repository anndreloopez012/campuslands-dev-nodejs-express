const http = require("node:http");

const codigos = [200, 201, 400, 404, 500];

console.log("=== Ejercicio 26: códigos de estado ===");
for (const codigo of codigos) {
  console.log(codigo, http.STATUS_CODES[codigo]);
}
