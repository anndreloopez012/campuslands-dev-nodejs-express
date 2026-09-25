const nombre = process.argv[2] || "";
const puntos = Number(process.argv[3] || -1);

if (!nombre || !Number.isInteger(puntos) || puntos < 0) {
  console.error("Indica un nombre y puntos válidos.");
} else {
  console.log("=== Ejercicio 14: validación de entrada ===");
  console.log("Jugador:", nombre);
  console.log("Puntos:", puntos);
}
