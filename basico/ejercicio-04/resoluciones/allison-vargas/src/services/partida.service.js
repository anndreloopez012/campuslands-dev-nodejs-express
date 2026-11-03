import { jugadores } from '../data/jugadores.data.js';

export function obtenerResumenPartida() {
  const jugadoresVivos = jugadores.filter((jugador) => jugador.vivo);

  return {
    total_jugadores: jugadores.length,
    jugadores_vivos: jugadoresVivos.length,
  };
}

export function listarJugadores() {
  return jugadores;
}
