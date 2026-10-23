const path = require("node:path");

const archivo = "partidas/ranking-2026.json";

console.log("=== Ejercicio 06: rutas seguras ===");
console.log("Base:", path.basename(archivo));
console.log("Extensión:", path.extname(archivo));
console.log("Ruta completa:", path.join(process.cwd(), archivo));
