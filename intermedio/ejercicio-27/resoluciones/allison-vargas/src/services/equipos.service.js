import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { REGIONES } from '../constants/moba.js';

const configListado = {
  filtros: {
    region: filtroEnum(REGIONES),
    buscar: (texto, error) => {
      const valor = texto.toLowerCase();
      if (valor.length < 1 || valor.length > 30) {
        error('debe tener entre 1 y 30 caracteres');
        return undefined;
      }
      return valor;
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
    victorias: (a, b) => b.victorias - a.victorias || a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

export function crearEquiposService({ repositorio, inscripcionesRepositorio, reloj = () => new Date() }) {
  const buscar = (id) => repositorio.buscar(id);

  function obtener(id) {
    const equipo = repositorio.buscar(id);
    if (!equipo) throw new NotFoundError(`No existe el equipo ${id}`, 'EQUIPO_NO_ENCONTRADO');
    return equipo;
  }

  function nombreLibre(nombre, idActual) {
    const repetido = repositorio.listar((e) => e.id !== idActual && e.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido.length) throw new ConflictError(`Ya existe un equipo llamado ${nombre}`, 'NOMBRE_DUPLICADO');
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { region, buscar: texto } = consulta.filtros;
    const filtrados = repositorio
      .listar((e) =>
        (region === undefined || e.region === region)
        && (texto === undefined || e.nombre.toLowerCase().includes(texto) || e.tag.toLowerCase().includes(texto)))
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  function crear({ nombre, tag, region }) {
    nombreLibre(nombre);
    if (repositorio.listar((e) => e.tag === tag).length) {
      throw new ConflictError(`Ya existe un equipo con el tag ${tag}`, 'TAG_DUPLICADO');
    }
    return repositorio.crear({ nombre, tag, region, victorias: 0, derrotas: 0, creadoEn: reloj().toISOString() });
  }

  function actualizar(id, cambios) {
    obtener(id);
    if (cambios.nombre !== undefined) nombreLibre(cambios.nombre, id);
    return repositorio.actualizar(id, cambios);
  }

  function eliminar(id) {
    const equipo = obtener(id);
    if (inscripcionesRepositorio.listar((i) => i.equipoId === id).length) {
      throw new ConflictError('El equipo esta inscrito en al menos un torneo', 'EQUIPO_INSCRITO');
    }
    repositorio.eliminar(id);
    return equipo;
  }

  return { buscar, obtener, listar, crear, actualizar, eliminar };
}
