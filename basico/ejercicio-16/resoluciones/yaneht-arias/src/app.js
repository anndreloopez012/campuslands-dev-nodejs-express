function responder(ruta) {
  if (ruta === "/") {
    return "Servidor de juego iniciado";
  }

  return "Ruta no encontrada";
}

console.log("=== Ejercicio 16: primera ruta ===");
console.log(responder(process.argv[2] || "/"));
