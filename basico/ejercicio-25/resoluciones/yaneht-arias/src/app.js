function responder(estado, mensaje) {
  console.log(`HTTP ${estado}: ${mensaje}`);
}

console.log("=== Ejercicio 25: respuestas HTTP ===");
responder(200, "Partida encontrada");
responder(404, "Partida no encontrada");
