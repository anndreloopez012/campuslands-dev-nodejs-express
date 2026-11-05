import {
  ConflictError,
  NotFoundError,
  ReferenciaError,
  UnprocessableError,
  ValidationError,
} from '../../utils/errors.js';
import { EVENTOS } from '../../constants/dominio.js';

const porId = (a, b) => a.id - b.id;

export function crearPartidasService({ repositorio, jugadores, eventos, reloj }) {
  function obtener(id) {
    const partida = repositorio.buscar(id);
    if (!partida) throw new NotFoundError(`No existe la partida ${id}`, 'PARTIDA_NO_ENCONTRADA');
    return partida;
  }

  function listar({ estado, jugadorId, mapa } = {}, comparador = porId) {
    return repositorio
      .listar((p) =>
        (estado === undefined || p.estado === estado)
        && (mapa === undefined || p.mapa === mapa)
        && (jugadorId === undefined || p.jugadorA === jugadorId || p.jugadorB === jugadorId))
      .sort(comparador);
  }

  function crear({ jugadorA, jugadorB, mapa }) {
    if (jugadorA === jugadorB) {
      throw new ValidationError('Datos invalidos', [
        { campo: 'jugadorB', mensaje: 'debe ser distinto de jugadorA' },
      ]);
    }
    for (const [campo, id] of [['jugadorA', jugadorA], ['jugadorB', jugadorB]]) {
      if (!jugadores.buscar(id)) throw new ReferenciaError(campo, `No existe el jugador ${id}`);
    }
    return repositorio.crear({
      jugadorA,
      jugadorB,
      mapa,
      estado: 'pendiente',
      puntajeA: null,
      puntajeB: null,
      ganadorId: null,
      creadaEn: reloj().toISOString(),
      finalizadaEn: null,
    });
  }

  async function registrarResultado(id, { puntajeA, puntajeB }) {
    const partida = obtener(id);
    if (partida.estado === 'finalizada') {
      throw new ConflictError('La partida ya tiene un resultado registrado', 'PARTIDA_FINALIZADA');
    }
    if (puntajeA === puntajeB) {
      throw new UnprocessableError('Un empate no es un resultado valido', 'EMPATE_NO_PERMITIDO', [
        { campo: 'puntajeB', mensaje: 'debe ser distinto de puntajeA' },
      ]);
    }
    const gana = puntajeA > puntajeB;
    const ganadorId = gana ? partida.jugadorA : partida.jugadorB;
    const perdedorId = gana ? partida.jugadorB : partida.jugadorA;
    const final = repositorio.actualizar(id, {
      estado: 'finalizada',
      puntajeA,
      puntajeB,
      ganadorId,
      finalizadaEn: reloj().toISOString(),
    });
    await eventos.emitir(EVENTOS.PARTIDA_FINALIZADA, {
      partidaId: id,
      ganadorId,
      perdedorId,
      puntajeGanador: Math.max(puntajeA, puntajeB),
      puntajePerdedor: Math.min(puntajeA, puntajeB),
      mapa: partida.mapa,
    });
    return final;
  }

  return { obtener, listar, crear, registrarResultado, contar: () => repositorio.listar().length };
}
