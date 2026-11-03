import { equiposRepository } from '../repositories/equipos.repository.js';
import { jugadoresRepository } from '../repositories/jugadores.repository.js';
import { AppError } from '../utils/AppError.js';

export function obtener(id) {
  const equipo = equiposRepository.findById(id);
  if (!equipo) throw new AppError('El equipo no existe', 404);
  return equipo;
}

export const listar = (deporte) =>
  deporte ? equiposRepository.findByDeporte(deporte) : equiposRepository.findAll();

export function listarJugadores(id) {
  obtener(id);
  return jugadoresRepository.findByEquipo(id);
}

function verificarNombreLibre(nombre, idActual) {
  const existente = equiposRepository.findByNombre(nombre);
  if (existente && existente.id !== idActual) {
    throw new AppError('Ya existe un equipo con ese nombre', 409);
  }
}

export function crear(datos) {
  verificarNombreLibre(datos.nombre);
  return equiposRepository.create(datos);
}

export function actualizar(id, datos) {
  const actual = obtener(id);
  verificarNombreLibre(datos.nombre, id);
  if (datos.deporte !== actual.deporte && jugadoresRepository.countByEquipo(id) > 0) {
    throw new AppError('No se puede cambiar el deporte de un equipo con jugadores', 409);
  }
  return equiposRepository.update(id, datos);
}

export function eliminar(id) {
  obtener(id);
  if (jugadoresRepository.countByEquipo(id) > 0) {
    throw new AppError('No se puede eliminar un equipo que tiene jugadores', 409);
  }
  equiposRepository.delete(id);
}
