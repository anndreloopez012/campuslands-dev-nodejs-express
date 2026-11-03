import * as jugadoresService from './jugadores.service.js';
import { calcularPuntos } from './puntuacion.service.js';
import { paginar } from './paginacion.service.js';

const partidas = [];

export function listar(query) {
  const jugadorId = query.jugadorId === undefined ? null : Number(query.jugadorId);
  const filtradas = jugadorId ? partidas.filter((p) => p.jugadorId === jugadorId) : partidas;
  return paginar(filtradas, query);
}

export function registrar({ jugadorId, posicion, eliminaciones }) {
  jugadoresService.obtener(jugadorId);

  const puntos = calcularPuntos({ posicion, eliminaciones });
  const jugador = jugadoresService.registrarResultado(jugadorId, { puntos, eliminaciones });

  const partida = {
    id: partidas.length + 1,
    jugadorId,
    posicion,
    eliminaciones,
    puntos,
    fecha: new Date().toISOString(),
  };
  partidas.push(partida);

  return { partida, jugador };
}
