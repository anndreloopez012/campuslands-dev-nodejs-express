import { asignacionesRepository } from '../repositories/asignaciones.repository.js';
import { tripulantesRepository } from '../repositories/tripulantes.repository.js';
import { ConflictError, NotFoundError, ReferenciaError } from '../utils/errors.js';
import { obtener as obtenerMision, tripulantesDe } from './misiones.service.js';
import { misionesDe } from './tripulantes.service.js';

const ESTADOS_CERRADOS = ['completada', 'cancelada'];

export const listarPorMision = (misionId) => tripulantesDe(misionId);

export const listarPorTripulante = (tripulanteId) => misionesDe(tripulanteId);

export function asignar(misionId, { tripulanteId, rol }) {
  const mision = obtenerMision(misionId);
  const tripulante = tripulantesRepository.buscar(tripulanteId);

  if (!tripulante) throw new ReferenciaError('tripulanteId', `el tripulante ${tripulanteId} no existe`);
  if (ESTADOS_CERRADOS.includes(mision.estado)) {
    throw new ConflictError(`La mision esta ${mision.estado} y no admite nuevas asignaciones`, 'MISION_CERRADA');
  }
  if (tripulante.naveId !== mision.naveId) {
    throw new ConflictError(
      `${tripulante.nombre} pertenece a la nave ${tripulante.naveId} y la mision es de la nave ${mision.naveId}`,
      'TRIPULANTE_OTRA_NAVE',
    );
  }
  if (asignacionesRepository.buscarPar(misionId, tripulanteId)) {
    throw new ConflictError(`${tripulante.nombre} ya esta asignado a esta mision`, 'ASIGNACION_DUPLICADA');
  }
  if (rol === 'lider' && asignacionesRepository.porMision(misionId).some((asignacion) => asignacion.rol === 'lider')) {
    throw new ConflictError('La mision ya tiene un lider', 'LIDER_DUPLICADO');
  }

  asignacionesRepository.crear({ misionId, tripulanteId, rol });
  return { id: tripulante.id, nombre: tripulante.nombre, rango: tripulante.rango, rol };
}

export function desasignar(misionId, tripulanteId) {
  const mision = obtenerMision(misionId);
  const asignacion = asignacionesRepository.buscarPar(misionId, tripulanteId);

  if (!asignacion) {
    throw new NotFoundError(
      `El tripulante ${tripulanteId} no esta asignado a la mision ${misionId}`,
      'ASIGNACION_NO_ENCONTRADA',
    );
  }
  if (ESTADOS_CERRADOS.includes(mision.estado)) {
    throw new ConflictError(`La mision esta ${mision.estado} y su equipo no puede modificarse`, 'MISION_CERRADA');
  }
  asignacionesRepository.eliminar(asignacion.id);
}
