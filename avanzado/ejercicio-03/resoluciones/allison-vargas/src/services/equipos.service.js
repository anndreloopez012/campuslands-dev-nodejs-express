import { ConflictError, NotFoundError } from '../utils/errors.js';

const porId = (a, b) => a.id - b.id;

export function crearEquiposService({ repositorio, reloj }) {
  function buscar(id) {
    return repositorio.buscar(id);
  }

  function obtener(id) {
    const equipo = repositorio.buscar(id);
    if (!equipo) throw new NotFoundError(`No existe el equipo ${id}`, 'EQUIPO_NO_ENCONTRADO');
    return equipo;
  }

  function listar({ region, buscar: texto } = {}, comparador = porId) {
    const buscado = texto?.toLowerCase();
    return repositorio
      .listar((e) =>
        (region === undefined || e.region === region)
        && (buscado === undefined || e.nombre.toLowerCase().includes(buscado)))
      .sort(comparador);
  }

  function crear(datos) {
    if (repositorio.listar((e) => e.nombre.toLowerCase() === datos.nombre.toLowerCase()).length) {
      throw new ConflictError(`Ya existe un equipo llamado ${datos.nombre}`, 'NOMBRE_DUPLICADO');
    }
    if (repositorio.listar((e) => e.tag === datos.tag).length) {
      throw new ConflictError(`Ya existe un equipo con el tag ${datos.tag}`, 'TAG_DUPLICADO');
    }
    return repositorio.crear({ ...datos, creadoEn: reloj().toISOString() });
  }

  return { buscar, obtener, listar, crear, contar: () => repositorio.listar().length };
}
