const service = require('../services/loadouts.service');

const CODES = [
  { code: 200, name: 'OK', when: 'Lectura correcta (GET /loadouts)' },
  { code: 201, name: 'Created', when: 'Recurso creado (POST /loadouts)' },
  { code: 204, name: 'No Content', when: 'Borrado correcto (DELETE /loadouts/:id)' },
  { code: 400, name: 'Bad Request', when: 'Peticion mal formada: id invalido, JSON roto, campos con tipo incorrecto' },
  { code: 401, name: 'Unauthorized', when: 'Falta la cabecera x-api-key o es incorrecta' },
  { code: 403, name: 'Forbidden', when: 'API key valida pero sin rol admin (DELETE, /admin/stats)' },
  { code: 404, name: 'Not Found', when: 'El recurso o la ruta no existen' },
  { code: 409, name: 'Conflict', when: 'Nombre de loadout repetido' },
  { code: 415, name: 'Unsupported Media Type', when: 'Cuerpo que no es application/json' },
  { code: 422, name: 'Unprocessable Content', when: 'Bien formada pero rompe reglas: arma desconocida o presupuesto excedido' },
  { code: 500, name: 'Internal Server Error', when: 'Bug inesperado (GET /debug/error)' },
  { code: 503, name: 'Service Unavailable', when: 'Mantenimiento (GET /matchmaking con MAINTENANCE=true)' },
];

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('El id debe ser un entero positivo');
    error.status = 400;
    throw error;
  }
  return id;
}

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'codigos de estado',
  });

const statusGuide = (req, res) => res.json({ ok: true, codes: CODES });

const list = (req, res) => res.status(200).json({ ok: true, loadouts: service.list() });

const detail = (req, res) => res.status(200).json({ ok: true, loadout: service.get(parseId(req.params.id)) });

const create = (req, res) => {
  const loadout = service.create(req.body);
  res.status(201).location(`/loadouts/${loadout.id}`).json({ ok: true, loadout });
};

const remove = (req, res) => {
  service.remove(parseId(req.params.id));
  res.status(204).end();
};

const adminStats = (req, res) => res.json({ ok: true, totalLoadouts: service.list().length, budget: service.BUDGET });

// 503 + Retry-After cuando el servicio esta temporalmente fuera de servicio
function matchmaking(req, res) {
  if (process.env.MAINTENANCE === 'true') {
    res.set('Retry-After', '120');
    return res.status(503).json({ ok: false, message: 'Matchmaking en mantenimiento. Intenta en 2 minutos.' });
  }
  res.json({ ok: true, queue: 'abierta', estimatedWaitSec: 25 });
}

// 500: bug inesperado (para ver que no se filtran detalles internos)
function debugError() {
  throw new Error('Fallo interno simulado');
}

module.exports = { info, statusGuide, list, detail, create, remove, adminStats, matchmaking, debugError };
