const jugadores = [{ id: 1, nombre: "Nova" }];

function crear(nombre) {
  jugadores.push({ id: jugadores.length + 1, nombre });
}

function listar() {
  return jugadores;
}

function actualizar(id, nombre) {
  const jugador = jugadores.find((item) => item.id === id);
  if (jugador) jugador.nombre = nombre;
}

function eliminar(id) {
  const indice = jugadores.findIndex((item) => item.id === id);
  if (indice >= 0) jugadores.splice(indice, 1);
}

crear("Leo");
actualizar(1, "Nova II");
eliminar(2);
console.log("=== Ejercicio 24: CRUD básico ===");
console.log(listar());
