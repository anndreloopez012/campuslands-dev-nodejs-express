const service = require('../services/stories.service');
const { ValidationError } = require('../errors/app-error');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'manejo de errores',
  });

const list = (req, res) => res.json({ ok: true, stories: service.listStories() });

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError(['id debe ser un entero positivo']);
  // Si getStory lanza NotFoundError, Express lo envia solo al errorHandler (codigo sincrono).
  res.json({ ok: true, story: service.getStory(id) });
}

function create(req, res) {
  res.status(201).json({ ok: true, story: service.createStory(req.body) });
}

// Rutas de demostracion: simulan bugs reales para ver como se responde.
function crashSync() {
  const config = undefined;
  return config.value; // TypeError
}

async function crashAsync() {
  throw new Error('Fallo simulado dentro de una funcion async');
}

module.exports = { info, list, detail, create, crashSync, crashAsync };
