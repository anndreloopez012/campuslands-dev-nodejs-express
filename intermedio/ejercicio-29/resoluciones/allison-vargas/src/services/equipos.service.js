import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { MODALIDADES } from '../constants/futbol.js';

const configListado = {
  filtros: { modalidad: filtroEnum(MODALIDADES) },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  },
  ordenPorDefecto: 'id',
};

export function crearEquiposService({ repositorio }) {
  const buscar = (id) => repositorio.buscar(id);

  function obtener(id) {
    const equipo = repositorio.buscar(id);
    if (!equipo) throw new NotFoundError(`No existe el equipo ${id}`, 'EQUIPO_NO_ENCONTRADO');
    return equipo;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { modalidad } = consulta.filtros;
    const filtrados = repositorio
      .listar((e) => modalidad === undefined || e.modalidad === modalidad)
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  const todos = (modalidad) => repositorio.listar((e) => e.modalidad === modalidad);

  function crear({ nombre, modalidad }) {
    if (repositorio.listar((e) => e.nombre.toLowerCase() === nombre.toLowerCase()).length) {
      throw new ConflictError(`Ya existe un equipo llamado ${nombre}`, 'EQUIPO_DUPLICADO');
    }
    return repositorio.crear({ nombre, modalidad });
  }

  return { buscar, obtener, listar, todos, crear };
}
