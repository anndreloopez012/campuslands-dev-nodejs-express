const service = require('../services/quests.service');
const { ok, created, noContent, fail } = require('../utils/response');

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('El id debe ser un entero positivo');
    Object.assign(error, { status: 400, code: 'INVALID_ID' });
    throw error;
  }
  return id;
}

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'respuestas HTTP correctas',
  });

// 200 OK + cabecera X-Total-Count + meta con el total
function list(req, res) {
  const { status } = req.query;
  if (status !== undefined && !service.STATUSES.includes(status)) {
    return fail(res, 400, 'INVALID_QUERY', `status debe ser uno de: ${service.STATUSES.join(', ')}`);
  }
  const quests = service.list(status);
  return ok(res, quests, { total: quests.length }, { 'X-Total-Count': String(quests.length) });
}

const detail = (req, res) => ok(res, service.get(parseId(req.params.id)));

// 201 Created + Location
function create(req, res) {
  const quest = service.create(req.body);
  return created(res, quest, `/quests/${quest.id}`);
}

// 200 OK con el recurso actualizado; 409 si ya estaba completada
const complete = (req, res) => ok(res, service.complete(parseId(req.params.id)));

// 204 No Content
function remove(req, res) {
  service.remove(parseId(req.params.id));
  return noContent(res);
}

module.exports = { info, list, detail, create, complete, remove };
