const service = require('../services/dishes.service');
const { sendJson, readJsonBody } = require('../utils/http');

function info(req, res) {
  sendJson(res, 200, {
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'mini API HTTP nativa',
  });
}

function list(req, res, { query }) {
  const type = query.get('type');
  if (type && !service.TYPES.includes(type)) {
    return sendJson(res, 400, { ok: false, message: `type debe ser uno de: ${service.TYPES.join(', ')}` });
  }
  const dishes = service.listDishes(type);
  sendJson(res, 200, { ok: true, total: dishes.length, dishes });
}

function detail(req, res, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return sendJson(res, 400, { ok: false, message: 'El id debe ser un entero positivo' });
  }
  const dish = service.getDish(id);
  if (!dish) return sendJson(res, 404, { ok: false, message: 'Platillo no encontrado' });
  sendJson(res, 200, { ok: true, dish });
}

async function create(req, res) {
  const data = await readJsonBody(req);
  const errors = service.validateDish(data);
  if (errors.length > 0) return sendJson(res, 400, { ok: false, message: 'Datos invalidos', errors });

  const dish = service.createDish(data);
  sendJson(res, 201, { ok: true, dish }, { Location: `/dishes/${dish.id}` });
}

module.exports = { info, list, detail, create };
