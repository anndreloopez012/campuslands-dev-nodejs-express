const { Router } = require('express');
const controller = require('../controllers/music.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-11', controller.info);
router.get('/albums/batch', controller.batch);
router.get('/albums/:id', controller.detail);
router.get('/summary', controller.summary);
router.get('/stats', controller.stats);

module.exports = router;
