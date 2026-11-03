const texto = '{"jugador":"Nova","puntos":120}';
const datos = JSON.parse(texto);
const guardado = JSON.stringify({ ...datos, nivel: 2 });

console.log("=== Ejercicio 09: JSON ===");
console.log("Datos:", datos);
console.log("Guardado:", guardado);
