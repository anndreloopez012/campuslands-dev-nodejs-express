const { ValidationError, NotFoundError } = require('../errors/app.error');
const equiposRepository = require('../data/equipos.repository');

const tiposValidos = ['futbol', 'futsal'];

function listarEquipos(opciones) {
  return equiposRepository.findAll(opciones);
}

function obtenerEquipo(id) {
  const equipo = equiposRepository.findById(id);
  if (!equipo) throw new NotFoundError(`El equipo con id ${id} no existe`);
  return equipo;
}

function crearEquipo(datos) {
  validar(datos);
  const { id, ...campos } = datos;
  if (id) throw new ValidationError('No debes enviar "id": el repositorio lo asigna automaticamente');
  return equiposRepository.save(campos);
}

function actualizarEquipo(id, datos) {
  obtenerEquipo(id);
  validar({ ...obtenerEquipo(id), ...datos, id });
  const { name, ...campos } = datos;
  return equiposRepository.save({ id, ...campos });
}

function eliminarEquipo(id) {
  obtenerEquipo(id);
  equiposRepository.remove(id);
}

function validar(datos) {
  const { name, ciudad, tipo, titulos } = datos;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new ValidationError('El campo "name" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!ciudad || typeof ciudad !== 'string' || ciudad.trim().length < 3) {
    throw new ValidationError('El campo "ciudad" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!tiposValidos.includes(tipo)) {
    throw new ValidationError(`El tipo "${tipo}" no es valido. Tipos: ${tiposValidos.join(', ')}`);
  }
  if (!Number.isInteger(titulos) || titulos < 0) {
    throw new ValidationError('El campo "titulos" debe ser un entero mayor o igual a 0');
  }
}

module.exports = { listarEquipos, obtenerEquipo, crearEquipo, actualizarEquipo, eliminarEquipo };
