function obtener(ruta) {
  if (ruta === "/salud") {
    return { estado: 200, datos: "ok" };
  }

  if (ruta === "/jugadores") {
    return { estado: 200, datos: ["Nova", "Leo"] };
  }

  return { estado: 404, mensaje: "No encontrada" };
}

console.log("=== Ejercicio 17: rutas GET ===");
console.log(obtener(process.argv[2] || "/jugadores"));
