const { Router } = require('express');
const { makeController } = require('../controllers/heroes.controller');

function createRoutes(logger) {
  const controller = makeController(logger);
  const router = Router();

  router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
  router.get('/basico/ejercicio-27', controller.info);
  router.get('/heroes', controller.list);
  router.get('/heroes/:id', controller.detail);
  router.post('/matches', controller.createMatch);
  router.post('/auth/demo', controller.demoLogin);
  router.get('/boom', controller.boom);

  return router;
}

module.exports = { createRoutes };
