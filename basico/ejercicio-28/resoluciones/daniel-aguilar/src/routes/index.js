const { Router } = require('express');
const { makeController } = require('../controllers/match.controller');

function createRoutes(config) {
  const controller = makeController(config);
  const router = Router();

  router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
  router.get('/basico/ejercicio-28', controller.info);
  router.get('/config', controller.showConfig);
  router.get('/matches/limits', controller.limits);
  router.post('/matches/join', controller.join);

  if (config.debugRoutes) {
    router.get('/debug/profile', controller.debugProfile);
  }
  return router;
}

module.exports = { createRoutes };
