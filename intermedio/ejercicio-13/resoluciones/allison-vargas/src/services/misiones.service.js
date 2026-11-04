import { misionesRepository } from '../repositories/misiones.repository.js';
import { navesRepository } from '../repositories/naves.repository.js';
import { tripulantesRepository } from '../repositories/tripulantes.repository.js';
import { asignacionesRepository } from '../repositories/asignaciones.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { ESTADOS } from '../validators/schemas.js';
import { exigir } from './naves.service.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  nombre: (a, b) => collator.compare(a.nombre, b.nombre) || a.id - b.id,
  inicio: (a, b) => a.inicio.localeCompare(b.inicio) || a.id - b.id,
};

const TRANSICIONES = {
  planificada: ['en-curso', 'cancelada'],
  'en-curso': ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};

const INCLUIBLES = ['nave', 'tripulantes'];

const configListado = {
  filtros: { estado: filtroEnum(ESTADOS), naveId: filtroEntero(1, 1000000) },
  ordenes,
  ordenPorDefecto: 'inicio',
  incluibles: INCLUIBLES,
};

export const incluiblesMision = INCLUIBLES;

export function obtener(id) {
  const mision = misionesRepository.buscar(id);
  if (!mision) throw new NotFoundError(`No existe la mision ${id}`, 'MISION_NO_ENCONTRADA');
  return mision;
}

export function tripulantesDe(misionId) {
  return asignacionesRepository.porMision(misionId).flatMap((asignacion) => {
    const tripulante = tripulantesRepository.buscar(asignacion.tripulanteId);
    return tripulante
      ? [{ id: tripulante.id, nombre: tripulante.nombre, rango: tripulante.rango, rol: asignacion.rol }]
      : [];
  });
}

export function expandir(mision, incluir = []) {
  const salida = { ...mision };
  if (incluir.includes('nave')) {
    const nave = navesRepository.buscar(mision.naveId);
    salida.nave = nave ? { id: nave.id, nombre: nave.nombre, clase: nave.clase } : null;
  }
  if (incluir.includes('tripulantes')) salida.tripulantes = tripulantesDe(mision.id);
  return salida;
}

export function listar(query) {
  const { filtros, comparador, incluir, pagina, limite } = leerListado(query, configListado);
  const misiones = misionesRepository
    .listar((mision) =>
      (!filtros.estado || mision.estado === filtros.estado) &&
      (!filtros.naveId || mision.naveId === filtros.naveId))
    .sort(comparador)
    .map((mision) => expandir(mision, incluir));
  return paginar(misiones, pagina, limite);
}

export function crear(datos) {
  exigir(datos.naveId);
  return misionesRepository.crear(datos);
}

export function actualizar(id, cambios) {
  const actual = obtener(id);

  if (cambios.estado && cambios.estado !== actual.estado && !TRANSICIONES[actual.estado].includes(cambios.estado)) {
    const permitidas = TRANSICIONES[actual.estado].join(', ') || 'ninguna';
    throw new ConflictError(
      `No se puede pasar de ${actual.estado} a ${cambios.estado}. Transiciones permitidas: ${permitidas}`,
      'TRANSICION_INVALIDA',
    );
  }

  if (cambios.naveId !== undefined && cambios.naveId !== actual.naveId) {
    exigir(cambios.naveId);
    const asignadas = asignacionesRepository.porMision(id).length;
    if (asignadas) {
      throw new ConflictError(
        `La mision tiene ${asignadas} tripulantes asignados y no puede cambiar de nave`,
        'MISION_CON_ASIGNACIONES',
      );
    }
  }
  return misionesRepository.actualizar(id, cambios);
}

export function eliminar(id) {
  obtener(id);
  asignacionesRepository.eliminarPorMision(id);
  misionesRepository.eliminar(id);
}
