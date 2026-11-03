import * as jugadoresService from './jugadores.service.js';
import { paginar } from './paginacion.service.js';

export function obtenerRanking(query) {
  const ordenados = jugadoresService
    .listarTodos()
    .sort((a, b) => b.puntos - a.puntos)
    .map((jugador, indice) => ({ posicion: indice + 1, ...jugador }));

  return paginar(ordenados, query);
}
