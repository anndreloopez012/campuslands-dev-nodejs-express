const champions = [
  { id: 1, name: 'Valeria', rol: 'asesina', danioBase: 62, dificultad: 'alta' },
  { id: 2, name: 'Magnus', rol: 'tanque', danioBase: 48, dificultad: 'media' },
  { id: 3, name: 'Selene', rol: 'tirador', danioBase: 58, dificultad: 'baja' }
];

const rolesValidos = ['asesina', 'tanque', 'tirador', 'mago', 'soporte'];
const dificultadesValidas = ['baja', 'media', 'alta'];

function listarCampeones() {
  return champions;
}

function obtenerCampeon(id) {
  const campeon = champions.find((c) => c.id === id);
  if (!campeon) throw new NotFoundError(`El campeon con id ${id} no existe`);
  return campeon;
}

function crearCampeon(datos) {
  const { name, rol, danioBase, dificultad } = datos;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new ValidationError('El campo "name" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!rolesValidos.includes(rol)) {
    throw new ValidationError(`El rol "${rol}" no es valido. Roles: ${rolesValidos.join(', ')}`);
  }
  if (!Number.isInteger(danioBase) || danioBase < 10 || danioBase > 100) {
    throw new ValidationError('El campo "danioBase" debe ser un entero entre 10 y 100');
  }
  if (!dificultadesValidas.includes(dificultad)) {
    throw new ValidationError(`La dificultad "${dificultad}" no es valida. Valores: ${dificultadesValidas.join(', ')}`);
  }

  const nuevoCampeon = {
    id: champions.length + 1,
    name: name.trim(),
    rol,
    danioBase,
    dificultad
  };

  champions.push(nuevoCampeon);
  return nuevoCampeon;
}

function eliminarCampeon(id) {
  const indice = champions.findIndex((c) => c.id === id);
  if (indice === -1) throw new NotFoundError(`El campeon con id ${id} no existe`);
  champions.splice(indice, 1);
}

module.exports = { listarCampeones, obtenerCampeon, crearCampeon, eliminarCampeon };
