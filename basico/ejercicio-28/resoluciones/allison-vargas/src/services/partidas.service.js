let partidas = [];
let siguienteId = 1;

export function listarPartidas() {
  return partidas;
}

export function crearPartida({ numero_jugadores }) {
  const nuevaPartida = { id: siguienteId, numero_jugadores };
  siguienteId += 1;
  partidas.push(nuevaPartida);

  return nuevaPartida;
}
