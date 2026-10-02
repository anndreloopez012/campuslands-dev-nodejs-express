const partidas = [
  { id: 1, mapa: 'Isla Norte', jugadores: 100, ganador: 'Nova' },
  { id: 2, mapa: 'Desierto', jugadores: 60, ganador: 'Rex' },
  { id: 3, mapa: 'Ciudad Vieja', jugadores: 100, ganador: 'Pixel' }
];

export function getPartidas() {
  return partidas;
}

export function buscarPartida(id) {
  return partidas.find((p) => p.id === id);
}
