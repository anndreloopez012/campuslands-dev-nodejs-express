const { Router } = require('express');
const { makeController } = require('../controllers/workshop.controller');

function createRoutes(services) {
  const c = makeController(services);
  const router = Router();

  router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
  router.get('/basico/ejercicio-30', c.info);

  router.get('/motorcycles', c.listMotorcycles);
  router.post('/motorcycles', c.createMotorcycle);
  router.get('/motorcycles/:id', c.getMotorcycle);
  router.put('/motorcycles/:id', c.updateMotorcycle);
  router.delete('/motorcycles/:id', c.deleteMotorcycle);
  router.get('/motorcycles/:id/orders', c.motorcycleOrders);

  router.get('/orders', c.listOrders);
  router.post('/orders', c.createOrder);
  router.get('/orders/:id', c.getOrder);
  router.patch('/orders/:id/status', c.advanceOrder);

  router.get('/stats', c.stats);

  return router;
}

module.exports = { createRoutes };
