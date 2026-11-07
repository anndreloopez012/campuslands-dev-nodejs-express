const { ValidationError } = require('../errors/app.error');

const campeones = [
  { id: 1, name: 'Valeria', rol: 'asesina', danioBase: 62, dificultad: 'alta' },
  { id: 2, name: 'Magnus', rol: 'tanque', danioBase: 48, dificultad: 'media' },
  { id: 3, name: 'Selene', rol: 'tirador', danioBase: 58, dificultad: 'baja' }
];

const ROLES_VALIDOS = ['asesina', 'tanque', 'tirador', 'mago', 'soporte'];
const DIFICULTADES_VALIDAS = ['baja', 'media', 'alta'];

function listarCampeones(rol) {
  if (rol) {
    if (!ROLES_VALIDOS.includes(rol)) {
      throw new ValidationError(`El rol "${rol}" no es valido. Roles: ${ROLES_VALIDOS.join(', ')}`);
    }
    return campeones.filter((campeon) => campeon.rol === rol);
  }
  return campeones;
}

function obtenerCampeon(id) {
  const campeon = campeones.find((actual) => actual.id === id);
  if (!campeon) return null;
  return campeon;
}

function crearCampeon(datos) {
  const { name, rol, danioBase, dificultad } = datos;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new ValidationError('El campo "name" es obligatorio (min 3 caracteres)');
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    throw new ValidationError(`El rol "${rol}" no es valido. Roles: ${ROLES_VALIDOS.join(', ')}`);
  }
  if (!Number.isInteger(danioBase) || danioBase < 10 || danioBase > 100) {
    throw new ValidationError('El campo "danioBase" debe ser un entero entre 10 y 100');
  }
  if (!DIFICULTADES_VALIDAS.includes(dificultad)) {
    throw new ValidationError(`La dificultad debe ser: ${DIFICULTADES_VALIDAS.join(', ')}`);
  }

  const nuevo = { id: campeones.length + 1, name: name.trim(), rol, danioBase, dificultad };
  campeones.push(nuevo);
  return nuevo;
}

module.exports = { listarCampeones, obtenerCampeon, crearCampeon, ROLES_VALIDOS };
