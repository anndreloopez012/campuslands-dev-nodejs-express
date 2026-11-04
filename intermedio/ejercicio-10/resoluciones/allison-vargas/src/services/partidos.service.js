import { loadJson } from '../utils/loadJson.js';
import { consultarOrdenado } from './ordenamiento.service.js';
import { obtener } from './jugadores.service.js';
import { ordenPartidos } from '../validators/orden/partidos.orden.js';

const nombres = new Map(loadJson('jugadores.json').map((jugador) => [jugador.id, jugador.nombre]));

const partidos = loadJson('partidos.json').map(
  ({ ganadorId, perdedorId, ...resto }) => ({
    ...resto,
    ganador: { id: ganadorId, nombre: nombres.get(ganadorId) },
    perdedor: { id: perdedorId, nombre: nombres.get(perdedorId) },
  }),
);

export const listar = (query) => consultarOrdenado(partidos, query, ordenPartidos);

export function listarPorJugador(id, query) {
  obtener(id);
  const propios = partidos.filter((partido) => partido.ganador.id === id || partido.perdedor.id === id);
  return consultarOrdenado(propios, query, ordenPartidos);
}
