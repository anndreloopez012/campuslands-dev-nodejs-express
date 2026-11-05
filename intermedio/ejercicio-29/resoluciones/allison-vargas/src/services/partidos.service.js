import { NotFoundError, ReferenciaError, UnprocessableError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { MODALIDADES } from '../constants/futbol.js';

const configListado = {
  filtros: {
    equipoId: filtroEntero(1, 1000000),
    modalidad: filtroEnum(MODALIDADES),
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    reciente: (a, b) => b.id - a.id,
  },
  ordenPorDefecto: 'id',
};

export function crearPartidosService({ repositorio, equipos }) {
  function obtener(id) {
    const partido = repositorio.buscar(id);
    if (!partido) throw new NotFoundError(`No existe el partido ${id}`, 'PARTIDO_NO_ENCONTRADO');
    return partido;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { equipoId, modalidad } = consulta.filtros;
    const filtrados = repositorio
      .listar((p) => {
        if (equipoId !== undefined && p.localId !== equipoId && p.visitanteId !== equipoId) return false;
        if (modalidad !== undefined && equipos.buscar(p.localId)?.modalidad !== modalidad) return false;
        return true;
      })
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  const todos = () => repositorio.listar();

  function registrar({ localId, visitanteId, golesLocal, golesVisitante }) {
    const local = equipos.buscar(localId);
    if (!local) throw new ReferenciaError('localId', `No existe el equipo ${localId}`);
    const visitante = equipos.buscar(visitanteId);
    if (!visitante) throw new ReferenciaError('visitanteId', `No existe el equipo ${visitanteId}`);
    if (localId === visitanteId) {
      throw new UnprocessableError('Un equipo no puede jugar contra si mismo', 'MISMO_EQUIPO');
    }
    if (local.modalidad !== visitante.modalidad) {
      throw new UnprocessableError('Los equipos son de modalidades distintas', 'MODALIDAD_DISTINTA');
    }
    return repositorio.crear({ localId, visitanteId, golesLocal, golesVisitante });
  }

  return { obtener, listar, todos, registrar };
}
