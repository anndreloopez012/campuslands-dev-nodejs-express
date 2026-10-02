export function esPosicionValida(posicion) {
  return posicion >= 1 && posicion <= 100;
}

function calcularPuntaje(kills, posicion) {
  return kills * 10 + (101 - posicion);
}

export default calcularPuntaje;
