const fs = require("node:fs");
const path = require("node:path");

const archivo = path.join(__dirname, "mision.txt");
const contenido = fs.readFileSync(archivo, "utf8");

console.log("=== Ejercicio 05: leer archivos ===");
console.log(contenido);
