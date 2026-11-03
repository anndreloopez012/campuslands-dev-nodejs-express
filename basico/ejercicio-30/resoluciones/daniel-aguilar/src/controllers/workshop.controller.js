const { badRequest } = require('../utils/app-error');
const { parseId } = require('../utils/parse');

function makeController({ motorcycles, orders }) {
  const ok = (res, key, value, status = 200) => res.status(status).json({ ok: true, [key]: value });

  return {
    info: (req, res) =>
      res.json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'proyecto integrador basico',
      }),

    // --- Motocicletas ---
    listMotorcycles(req, res) {
      const list = motorcycles.list({ brand: req.query.brand });
      res.json({ ok: true, total: list.length, motorcycles: list });
    },
    getMotorcycle: (req, res) => ok(res, 'motorcycle', motorcycles.get(parseId(req.params.id))),
    createMotorcycle(req, res) {
      const moto = motorcycles.create(req.body);
      res.status(201).location(`/motorcycles/${moto.id}`);
      return ok(res, 'motorcycle', moto, 201);
    },
    updateMotorcycle: (req, res) => ok(res, 'motorcycle', motorcycles.update(parseId(req.params.id), req.body)),
    deleteMotorcycle(req, res) {
      motorcycles.remove(parseId(req.params.id));
      res.status(204).end();
    },
    motorcycleOrders(req, res) {
      const id = parseId(req.params.id);
      motorcycles.get(id); // 404 si no existe
      const list = orders.list({ motorcycleId: id });
      res.json({ ok: true, total: list.length, orders: list });
    },

    // --- Ordenes de servicio ---
    listOrders(req, res) {
      const { status } = req.query;
      if (status !== undefined && !orders.STATUSES.includes(status)) {
        throw badRequest(`status debe ser uno de: ${orders.STATUSES.join(', ')}`);
      }
      const list = orders.list({ status });
      res.json({ ok: true, total: list.length, orders: list });
    },
    getOrder: (req, res) => ok(res, 'order', orders.get(parseId(req.params.id))),
    createOrder(req, res) {
      const order = orders.create(req.body);
      res.status(201).location(`/orders/${order.id}`);
      return ok(res, 'order', order, 201);
    },
    advanceOrder: (req, res) => ok(res, 'order', orders.advance(parseId(req.params.id), req.body)),

    stats: (req, res) => ok(res, 'stats', orders.stats()),
  };
}

module.exports = { makeController };
