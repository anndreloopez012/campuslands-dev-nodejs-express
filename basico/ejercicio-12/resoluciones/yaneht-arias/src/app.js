function esperar() {
  return new Promise((resolve) => setTimeout(resolve, 100));
}

async function jugar() {
  console.log("=== Ejercicio 12: async await ===");
  await esperar();
  console.log("La partida terminó.");
}

jugar();
