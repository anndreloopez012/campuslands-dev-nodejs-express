const { ValidationError, NotFoundError } = require('../errors/app.error');

const renders = [];

function listarRenders() {
  return renders.map(({ id, escena, frame_actual, frames, prioridad }) => ({
    id, escena, progreso_pct: Math.round((frame_actual / frames) * 100), prioridad
  }));
}

function encolarRend(datos) {
  const { escena, frames, prioridad = 'normal' } = datos;

  if (!escena || typeof escena !== 'string' || escena.trim().length < 3) {
    throw new ValidationError('El campo "escena" es obligatorio (minimo 3 caracteres)');
  }
  if (!Number.isInteger(frames) || frames < 1 || frames > 10000) {
    throw new ValidationError('El campo "frames" debe ser un entero entre 1 y 10000');
  }
  if (!['baja', 'normal', 'alta'].includes(prioridad)) {
    throw new ValidationError('El campo "prioridad" debe ser: baja, normal o alta');
  }

  const nuevo = {
    id: renders.length + 1,
    escena: escena.trim(),
    frames,
    frame_actual: 0,
    prioridad,
    estado: 'en_cola'
  };
  renders.push(nuevo);
  return nuevo;
}

function consultarRend(id) {
  const render = renders.find((actual) => actual.id === id);
  if (!render) throw new NotFoundError(`El render ${id} no existe`);
  return render;
}

module.exports = { listarRenders, encolarRend, consultarRend };
