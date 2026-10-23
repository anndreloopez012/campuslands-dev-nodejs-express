const runtime = {
  version: process.version,
  platform: process.platform,
  architecture: process.arch,
  processId: process.pid,
};

const character = {
  name: "Ariadna",
  class: "Exploradora",
  level: 1,
  status: "Lista para la aventura",
};

console.log("=== Ejercicio 01: Node runtime y consola ===");
console.log(`Node.js: ${runtime.version}`);
console.log(`Plataforma: ${runtime.platform}`);
console.log(`Arquitectura: ${runtime.architecture}`);
console.log(`PID: ${runtime.processId}`);
console.log("\nPersonaje RPG:");
console.table(character);
console.log("\nEjercicio ejecutado correctamente.");