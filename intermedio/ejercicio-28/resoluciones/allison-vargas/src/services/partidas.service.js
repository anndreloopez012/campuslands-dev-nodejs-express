import { ConflictError, NotFoundError, ReferenciaError, UnprocessableError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ESTADOS_PARTIDA, MAPAS } from '../constants/juego.js';

const configListado = {
  filtros: {
    estado: filtroEnum(ESTADOS_PARTIDA),
    mapa: filtroEnum(MAPAS),
  },
  ordenes: {
    reciente: (a, b) => b.id - a.id,
    id: (a, b) => a.id - b.id,
  },
  ordenPorDefecto: 'reciente',
};

const vivosDe = (partida) =>
  partida.participantes.filter((id) => !partida.eliminaciones.some((e) => e.eliminadoId === id));

export function crearPartidasService({ repositorio, jugadores, reloj = () => new Date() }) {
  function buscar(id) {
    const partida = repositorio.buscar(id);
    if (!partida) throw new NotFoundError(`No existe la partida ${id}`, 'PARTIDA_NO_ENCONTRADA');
    return partida;
  }

  function presentar(partida) {
    return {
      id: partida.id,
      mapa: partida.mapa,
      cupos: partida.cupos,
      estado: partida.estado,
      participantes: [...partida.participantes],
      vivos: vivosDe(partida).length,
      ganadorId: partida.ganadorId,
      creadaEn: partida.creadaEn,
      iniciadaEn: partida.iniciadaEn,
      finalizadaEn: partida.finalizadaEn,
    };
  }

  function exigirEsperando(partida) {
    if (partida.estado !== 'esperando') {
      throw new ConflictError('La partida ya no admite cambios de jugadores', 'PARTIDA_CERRADA');
    }
  }

  const obtener = (id) => presentar(buscar(id));

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { estado, mapa } = consulta.filtros;
    const filtradas = repositorio
      .listar((p) => (estado === undefined || p.estado === estado) && (mapa === undefined || p.mapa === mapa))
      .sort(consulta.comparador)
      .map(presentar);
    return paginar(filtradas, consulta.pagina, consulta.limite);
  }

  function crear({ mapa, cupos }) {
    return presentar(repositorio.crear({
      mapa,
      cupos,
      estado: 'esperando',
      participantes: [],
      eliminaciones: [],
      ganadorId: null,
      creadaEn: reloj().toISOString(),
      iniciadaEn: null,
      finalizadaEn: null,
    }));
  }

  function unir(partidaId, { jugadorId }) {
    const partida = buscar(partidaId);
    if (!jugadores.buscar(jugadorId)) throw new ReferenciaError('jugadorId', `No existe el jugador ${jugadorId}`);
    exigirEsperando(partida);
    if (partida.participantes.includes(jugadorId)) {
      throw new ConflictError('El jugador ya esta en esta partida', 'JUGADOR_YA_EN_PARTIDA');
    }
    const ocupado = repositorio.listar((o) =>
      o.id !== partida.id && o.estado !== 'finalizada' && o.participantes.includes(jugadorId));
    if (ocupado.length) {
      throw new ConflictError(`El jugador ya esta en la partida ${ocupado[0].id}`, 'JUGADOR_OCUPADO');
    }
    if (partida.participantes.length >= partida.cupos) {
      throw new ConflictError('La partida no tiene cupos disponibles', 'PARTIDA_LLENA');
    }
    return presentar(repositorio.actualizar(partidaId, { participantes: [...partida.participantes, jugadorId] }));
  }

  function retirar(partidaId, jugadorId) {
    const partida = buscar(partidaId);
    exigirEsperando(partida);
    if (!partida.participantes.includes(jugadorId)) {
      throw new NotFoundError(`El jugador ${jugadorId} no esta en la partida ${partidaId}`, 'JUGADOR_NO_EN_PARTIDA');
    }
    return presentar(repositorio.actualizar(partidaId, {
      participantes: partida.participantes.filter((id) => id !== jugadorId),
    }));
  }

  function iniciar(partidaId) {
    const partida = buscar(partidaId);
    exigirEsperando(partida);
    if (partida.participantes.length < 2) {
      throw new ConflictError('Hacen falta al menos 2 jugadores para iniciar', 'JUGADORES_INSUFICIENTES');
    }
    return presentar(repositorio.actualizar(partidaId, { estado: 'en_curso', iniciadaEn: reloj().toISOString() }));
  }

  function exigirVivo(partida, id, campo) {
    if (!partida.participantes.includes(id)) throw new ReferenciaError(campo, `El jugador ${id} no esta en la partida`);
    if (!vivosDe(partida).includes(id)) {
      throw new ConflictError(`El jugador ${id} ya fue eliminado`, 'JUGADOR_YA_ELIMINADO');
    }
  }

  function cerrar(partida, eliminaciones, ganadorId) {
    for (const id of partida.participantes) {
      jugadores.registrarPartida(id, {
        gano: id === ganadorId,
        kills: eliminaciones.filter((e) => e.eliminadorId === id).length,
      });
    }
    return repositorio.actualizar(partida.id, {
      estado: 'finalizada',
      eliminaciones,
      ganadorId,
      finalizadaEn: reloj().toISOString(),
    });
  }

  function eliminar(partidaId, { eliminadoId, eliminadorId = null }) {
    const partida = buscar(partidaId);
    if (partida.estado !== 'en_curso') {
      throw new ConflictError('La partida no esta en curso', 'PARTIDA_NO_EN_CURSO');
    }
    exigirVivo(partida, eliminadoId, 'eliminadoId');
    if (eliminadorId !== null) {
      if (eliminadorId === eliminadoId) {
        throw new UnprocessableError('Un jugador no puede eliminarse a si mismo', 'ELIMINACION_INVALIDA');
      }
      exigirVivo(partida, eliminadorId, 'eliminadorId');
    }

    const vivos = vivosDe(partida);
    const eliminaciones = [...partida.eliminaciones, { eliminadoId, eliminadorId, posicion: vivos.length }];
    const restantes = vivos.filter((id) => id !== eliminadoId);

    if (restantes.length === 1) {
      cerrar(partida, eliminaciones, restantes[0]);
      return { eliminadoId, posicion: vivos.length, restantes: 1, finalizada: true, ganadorId: restantes[0] };
    }
    repositorio.actualizar(partidaId, { eliminaciones });
    return { eliminadoId, posicion: vivos.length, restantes: restantes.length, finalizada: false, ganadorId: null };
  }

  function resultados(partidaId) {
    const partida = buscar(partidaId);
    if (partida.estado !== 'finalizada') {
      throw new ConflictError('La partida todavia no termina', 'PARTIDA_NO_FINALIZADA');
    }
    const filas = [
      { posicion: 1, jugadorId: partida.ganadorId },
      ...partida.eliminaciones.map((e) => ({ posicion: e.posicion, jugadorId: e.eliminadoId })),
    ];
    return filas
      .sort((a, b) => a.posicion - b.posicion)
      .map(({ posicion, jugadorId }) => ({
        posicion,
        jugadorId,
        nick: jugadores.obtener(jugadorId).nick,
        kills: partida.eliminaciones.filter((e) => e.eliminadorId === jugadorId).length,
      }));
  }

  return { obtener, listar, crear, unir, retirar, iniciar, eliminar, resultados };
}
