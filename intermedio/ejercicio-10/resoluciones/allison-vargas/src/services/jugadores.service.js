import { loadJson } from '../utils/loadJson.js';
import { NotFoundError } from '../utils/errors.js';
import { consultarOrdenado } from './ordenamiento.service.js';
import { ordenJugadores } from '../validators/orden/jugadores.orden.js';

const jugadores = loadJson('jugadores.json').map((jugador) => {
  const partidos = jugador.victorias + jugador.derrotas;
  return {
    ...jugador,
    efectividad: partidos ? Number((jugador.victorias / partidos).toFixed(2)) : null,
  };
});

export const listar = (query) => consultarOrdenado(jugadores, query, ordenJugadores);

export function obtener(id) {
  const jugador = jugadores.find((item) => item.id === id);
  if (!jugador) throw new NotFoundError(`No existe el jugador ${id}`, 'JUGADOR_NO_ENCONTRADO');
  return jugador;
}
