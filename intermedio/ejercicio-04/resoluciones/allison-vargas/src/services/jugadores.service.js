import { loadJson } from '../utils/loadJson.js';
import { AppError } from '../utils/AppError.js';
import { obtenerLiga } from './puntuacion.service.js';
import { paginar } from './paginacion.service.js';

const jugadores = loadJson('jugadores.json');

const conLiga = (jugador) => ({ ...jugador, liga: obtenerLiga(jugador.puntos) });

function buscar(id) {
  const jugador = jugadores.find((j) => j.id === id);
  if (!jugador) throw new AppError('El jugador no existe', 404);
  return jugador;
}

export const listar = (query) => {
  const resultado = paginar(jugadores, query);
  return { ...resultado, data: resultado.data.map(conLiga) };
};

export const listarTodos = () => jugadores.map(conLiga);

export const obtener = (id) => conLiga(buscar(id));

export function registrarResultado(id, { puntos, eliminaciones }) {
  const jugador = buscar(id);
  jugador.puntos += puntos;
  jugador.eliminaciones += eliminaciones;
  jugador.partidas += 1;
  return conLiga(jugador);
}

export function obtenerEstadisticas(id) {
  const jugador = buscar(id);
  const promedio = jugador.partidas ? jugador.eliminaciones / jugador.partidas : 0;
  return {
    id: jugador.id,
    nick: jugador.nick,
    liga: obtenerLiga(jugador.puntos),
    partidas: jugador.partidas,
    eliminaciones: jugador.eliminaciones,
    promedioEliminaciones: Number(promedio.toFixed(2)),
  };
}
