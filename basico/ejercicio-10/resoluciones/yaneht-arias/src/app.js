function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function iniciarPartida() {
  console.log("=== Ejercicio 10: funciones asíncronas ===");
  console.log("Preparando la partida...");
  await esperar(100);
  console.log("Partida iniciada.");
}

iniciarPartida();
