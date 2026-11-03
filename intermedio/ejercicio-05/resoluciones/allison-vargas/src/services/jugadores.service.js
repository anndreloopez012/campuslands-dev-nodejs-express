import { jugadoresRepository } from '../repositories/jugadores.repository.js';
import { equiposRepository } from '../repositories/equipos.repository.js';
import { AppError } from '../utils/AppError.js';
import { POSICIONES, LIMITE_PLANTILLA } from '../validators/jugador.validator.js';

export function obtener(id) {
  const jugador = jugadoresRepository.findById(id);
  if (!jugador) throw new AppError('El jugador no existe', 404);
  return jugador;
}

export function listar(equipoId) {
  return equipoId ? jugadoresRepository.findByEquipo(equipoId) : jugadoresRepository.findAll();
}

function verificarReglas(datos, idActual) {
  const equipo = equiposRepository.findById(datos.equipoId);
  if (!equipo) throw new AppError('El equipo no existe', 404);

  if (!POSICIONES[equipo.deporte].includes(datos.posicion)) {
    throw new AppError(
      `La posicion ${datos.posicion} no existe en ${equipo.deporte}. Validas: ${POSICIONES[equipo.deporte].join(', ')}`,
      400
    );
  }

  const dorsalOcupado = jugadoresRepository.findByDorsal(datos.equipoId, datos.dorsal);
  if (dorsalOcupado && dorsalOcupado.id !== idActual) {
    throw new AppError('Ese dorsal ya esta ocupado en el equipo', 409);
  }

  return equipo;
}

export function crear(datos) {
  const equipo = verificarReglas(datos);
  if (jugadoresRepository.countByEquipo(equipo.id) >= LIMITE_PLANTILLA[equipo.deporte]) {
    throw new AppError(`La plantilla de ${equipo.deporte} esta completa`, 409);
  }
  return jugadoresRepository.create(datos);
}

export function actualizar(id, datos) {
  const actual = obtener(id);
  if (datos.equipoId !== actual.equipoId) {
    throw new AppError('No se puede cambiar el equipo de un jugador', 409);
  }
  verificarReglas(datos, id);
  return jugadoresRepository.update(id, datos);
}

export function eliminar(id) {
  obtener(id);
  jugadoresRepository.delete(id);
}
