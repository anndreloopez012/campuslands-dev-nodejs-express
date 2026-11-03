import * as personajesRepo from '../repositories/personajes.repository.js';
import * as misionesRepo from '../repositories/misiones.repository.js';
import { AppError } from '../utils/AppError.js';

export const listarPersonajes = () => personajesRepo.listar();
export const listarMisiones = () => misionesRepo.listar();

export function aceptarMision(misionId, personajeId) {
  const mision = misionesRepo.buscarPorId(misionId);
  if (!mision) throw new AppError('La mision no existe', 404);

  const personaje = personajesRepo.buscarPorId(personajeId);
  if (!personaje) throw new AppError('El personaje no existe', 404);

  if (!mision.disponible) {
    throw new AppError('La mision ya no esta disponible', 409);
  }
  if (personaje.nivel < mision.nivelRequerido) {
    throw new AppError(
      `Nivel insuficiente: se requiere nivel ${mision.nivelRequerido} y ${personaje.nombre} es nivel ${personaje.nivel}`,
      403
    );
  }
  if (personaje.misionesAceptadas.includes(mision.id)) {
    throw new AppError('El personaje ya acepto esta mision', 409);
  }

  personaje.misionesAceptadas.push(mision.id);
  return { personaje: personaje.nombre, mision: mision.titulo };
}
