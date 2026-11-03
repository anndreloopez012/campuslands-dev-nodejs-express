const puerto = process.env.PORT || 3000;
const ambiente = process.env.NODE_ENV || "desarrollo";

console.log("=== Ejercicio 28: configuración por entorno ===");
console.log("Puerto:", puerto);
console.log("Ambiente:", ambiente);
