import { ConflictError, NotFoundError, ReferenciaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ESTADOS_TORNEO, FORMATOS } from '../constants/moba.js';

const configListado = {
  filtros: {
    estado: filtroEnum(ESTADOS_TORNEO),
    formato: filtroEnum(FORMATOS),
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    inicio: (a, b) => a.inicio.localeCompare(b.inicio) || a.id - b.id,
    premio: (a, b) => b.premio - a.premio || a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

export function crearTorneosService({ repositorio, inscripcionesRepositorio, equipos, reloj = () => new Date() }) {
  const delTorneo = (torneoId) => inscripcionesRepositorio.listar((i) => i.torneoId === torneoId);
  const conInscritos = (torneo) => ({ ...torneo, inscritos: delTorneo(torneo.id).length });

  function buscarTorneo(id) {
    const torneo = repositorio.buscar(id);
    if (!torneo) throw new NotFoundError(`No existe el torneo ${id}`, 'TORNEO_NO_ENCONTRADO');
    return torneo;
  }

  function armar(inscripcion) {
    const { id, nombre, tag } = equipos.obtener(inscripcion.equipoId);
    return {
      id: inscripcion.id,
      torneoId: inscripcion.torneoId,
      equipo: { id, nombre, tag },
      inscritoEn: inscripcion.inscritoEn,
    };
  }

  function exigirInscripcionAbierta(torneo) {
    if (torneo.estado !== 'inscripcion') {
      throw new ConflictError('El torneo ya no admite cambios en las inscripciones', 'INSCRIPCION_CERRADA');
    }
  }

  function obtener(id) {
    return conInscritos(buscarTorneo(id));
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { estado, formato } = consulta.filtros;
    const filtrados = repositorio
      .listar((t) => (estado === undefined || t.estado === estado) && (formato === undefined || t.formato === formato))
      .map(conInscritos)
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  function listarInscripciones(torneoId) {
    buscarTorneo(torneoId);
    return delTorneo(torneoId).sort((a, b) => a.id - b.id).map(armar);
  }

  function inscribir(torneoId, { equipoId }) {
    const torneo = buscarTorneo(torneoId);
    if (!equipos.buscar(equipoId)) throw new ReferenciaError('equipoId', `No existe el equipo ${equipoId}`);
    exigirInscripcionAbierta(torneo);

    const actuales = delTorneo(torneoId);
    if (actuales.some((i) => i.equipoId === equipoId)) {
      throw new ConflictError('El equipo ya esta inscrito en este torneo', 'EQUIPO_YA_INSCRITO');
    }
    if (actuales.length >= torneo.cupos) {
      throw new ConflictError('El torneo no tiene cupos disponibles', 'TORNEO_LLENO');
    }
    return armar(inscripcionesRepositorio.crear({ torneoId, equipoId, inscritoEn: reloj().toISOString() }));
  }

  function retirar(torneoId, equipoId) {
    const torneo = buscarTorneo(torneoId);
    exigirInscripcionAbierta(torneo);
    const inscripcion = delTorneo(torneoId).find((i) => i.equipoId === equipoId);
    if (!inscripcion) {
      throw new NotFoundError(`El equipo ${equipoId} no esta inscrito en el torneo ${torneoId}`, 'INSCRIPCION_NO_ENCONTRADA');
    }
    const retirada = armar(inscripcion);
    inscripcionesRepositorio.eliminar(inscripcion.id);
    return retirada;
  }

  return { obtener, listar, listarInscripciones, inscribir, retirar };
}
