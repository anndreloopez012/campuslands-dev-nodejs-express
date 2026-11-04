import { tripulantesRepository } from '../repositories/tripulantes.repository.js';
import { navesRepository } from '../repositories/naves.repository.js';
import { misionesRepository } from '../repositories/misiones.repository.js';
import { asignacionesRepository } from '../repositories/asignaciones.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { RANGOS, ESPECIES } from '../validators/schemas.js';
import { exigir, exigirCupo } from './naves.service.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  nombre: (a, b) => collator.compare(a.nombre, b.nombre) || a.id - b.id,
  rango: (a, b) => RANGOS.indexOf(a.rango) - RANGOS.indexOf(b.rango) || collator.compare(a.nombre, b.nombre) || a.id - b.id,
};

const INCLUIBLES = ['nave', 'misiones'];

const configListado = {
  filtros: {
    naveId: filtroEntero(1, 1000000),
    rango: filtroEnum(RANGOS),
    especie: filtroEnum(ESPECIES),
  },
  ordenes,
  ordenPorDefecto: 'nombre',
  incluibles: INCLUIBLES,
};

export const incluiblesTripulante = INCLUIBLES;

export function obtener(id) {
  const tripulante = tripulantesRepository.buscar(id);
  if (!tripulante) throw new NotFoundError(`No existe el tripulante ${id}`, 'TRIPULANTE_NO_ENCONTRADO');
  return tripulante;
}

export function misionesDe(tripulanteId) {
  return asignacionesRepository.porTripulante(tripulanteId).flatMap((asignacion) => {
    const mision = misionesRepository.buscar(asignacion.misionId);
    return mision ? [{ id: mision.id, nombre: mision.nombre, estado: mision.estado, rol: asignacion.rol }] : [];
  });
}

export function expandir(tripulante, incluir = []) {
  const salida = { ...tripulante };
  if (incluir.includes('nave')) {
    const nave = navesRepository.buscar(tripulante.naveId);
    salida.nave = nave ? { id: nave.id, nombre: nave.nombre, clase: nave.clase } : null;
  }
  if (incluir.includes('misiones')) salida.misiones = misionesDe(tripulante.id);
  return salida;
}

export function listar(query) {
  const { filtros, comparador, incluir, pagina, limite } = leerListado(query, configListado);
  const tripulantes = tripulantesRepository
    .listar((tripulante) =>
      (!filtros.naveId || tripulante.naveId === filtros.naveId) &&
      (!filtros.rango || tripulante.rango === filtros.rango) &&
      (!filtros.especie || tripulante.especie === filtros.especie))
    .sort(comparador)
    .map((tripulante) => expandir(tripulante, incluir));
  return paginar(tripulantes, pagina, limite);
}

export function crear(datos) {
  const nave = exigir(datos.naveId);
  exigirCupo(nave);
  return tripulantesRepository.crear(datos);
}

export function actualizar(id, cambios) {
  const actual = obtener(id);
  if (cambios.naveId !== undefined && cambios.naveId !== actual.naveId) {
    const nave = exigir(cambios.naveId);
    const asignadas = asignacionesRepository.porTripulante(id).length;
    if (asignadas) {
      throw new ConflictError(
        `El tripulante tiene ${asignadas} misiones asignadas y no puede cambiar de nave`,
        'TRIPULANTE_ASIGNADO',
      );
    }
    exigirCupo(nave, id);
  }
  return tripulantesRepository.actualizar(id, cambios);
}

export function eliminar(id) {
  obtener(id);
  asignacionesRepository.eliminarPorTripulante(id);
  tripulantesRepository.eliminar(id);
}
