const jugador = {
  nombre: "Nova",
  nivel: 2,
  inventario: ["espada", "poción"],
};

function resumen() {
  return `${jugador.nombre} tiene nivel ${jugador.nivel} y ${jugador.inventario.length} objetos`;
}

console.log("=== Ejercicio 30: proyecto integrador ===");
console.log(resumen());
