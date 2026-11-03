const { Router } = require('express');
const controller = require('../controllers/stories.controller');
const { asyncHandler } = require('../utils/async-handler');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-13', controller.info);
router.get('/stories', controller.list);
router.get('/stories/:id', controller.detail);
router.post('/stories', controller.create);

// Demostracion de errores inesperados
router.get('/crash/sync', controller.crashSync);
router.get('/crash/async', asyncHandler(controller.crashAsync));

module.exports = router;
