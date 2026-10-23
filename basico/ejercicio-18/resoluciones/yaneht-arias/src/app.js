function crearJugador(datos) {
  if (!datos.nombre) {
    return { estado: 400, mensaje: "Falta el nombre" };
  }

  return { estado: 201, datos };
}

console.log("=== Ejercicio 18: rutas POST ===");
console.log(crearJugador({ nombre: "Nova", puntos: 10 }));
