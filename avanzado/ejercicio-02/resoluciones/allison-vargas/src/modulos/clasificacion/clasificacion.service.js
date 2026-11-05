import { FACTOR_K, RATING_INICIAL } from '../../constants/dominio.js';

const CLAVE_RANKING = 'clasificacion:ranking';

export function calcularCambio(ratingGanador, ratingPerdedor, factorK = FACTOR_K) {
  const esperado = 1 / (1 + 10 ** ((ratingPerdedor - ratingGanador) / 400));
  return Math.round(factorK * (1 - esperado));
}

const filaInicial = () => ({ rating: RATING_INICIAL, partidas: 0, victorias: 0, derrotas: 0 });

export function crearClasificacionService({ tabla, jugadores, cache }) {
  const procesadas = new Set();

  function alta(jugadorId) {
    if (tabla.tiene(jugadorId)) return false;
    tabla.guardar(jugadorId, filaInicial());
    cache.borrar(CLAVE_RANKING);
    return true;
  }

  function aplicarResultado({ partidaId, ganadorId, perdedorId }) {
    if (procesadas.has(partidaId)) return false;
    alta(ganadorId);
    alta(perdedorId);
    const ganador = tabla.obtener(ganadorId);
    const perdedor = tabla.obtener(perdedorId);
    const cambio = calcularCambio(ganador.rating, perdedor.rating);
    tabla.guardar(ganadorId, {
      ...ganador,
      rating: ganador.rating + cambio,
      partidas: ganador.partidas + 1,
      victorias: ganador.victorias + 1,
    });
    tabla.guardar(perdedorId, {
      ...perdedor,
      rating: perdedor.rating - cambio,
      partidas: perdedor.partidas + 1,
      derrotas: perdedor.derrotas + 1,
    });
    procesadas.add(partidaId);
    cache.borrar(CLAVE_RANKING);
    return true;
  }

  function construirRanking() {
    const filas = [];
    for (const fila of tabla.todos()) {
      const jugador = jugadores.buscar(fila.jugadorId);
      if (jugador) filas.push({ ...fila, alias: jugador.alias, region: jugador.region });
    }
    filas.sort((a, b) => b.rating - a.rating || b.victorias - a.victorias || a.jugadorId - b.jugadorId);
    return Object.freeze(filas.map((fila, indice) => Object.freeze({
      posicion: indice + 1,
      jugadorId: fila.jugadorId,
      alias: fila.alias,
      region: fila.region,
      rating: fila.rating,
      partidas: fila.partidas,
      victorias: fila.victorias,
      derrotas: fila.derrotas,
    })));
  }

  function ranking() {
    return cache.consultar(CLAVE_RANKING, construirRanking);
  }

  async function posicionDe(jugadorId) {
    jugadores.obtener(jugadorId);
    alta(jugadorId);
    const { valor, acierto } = await ranking();
    return { fila: valor.find((fila) => fila.jugadorId === jugadorId), acierto };
  }

  function sincronizar() {
    jugadores.listar().forEach((jugador) => alta(jugador.id));
  }

  return { alta, aplicarResultado, ranking, posicionDe, sincronizar, contar: () => tabla.todos().length };
}
