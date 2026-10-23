function leerJugador(texto) {
  try {
    return JSON.parse(texto);
  } catch (error) {
    return { error: "El texto no es JSON válido" };
  }
}

console.log("=== Ejercicio 13: manejo de errores ===");
console.log(leerJugador("no válido"));
