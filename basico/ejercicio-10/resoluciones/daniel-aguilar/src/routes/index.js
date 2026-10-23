const { Router } = require('express');
const controller = require('../controllers/players.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-10', controller.info);
router.get('/players/:id', controller.detail);
router.get('/ranking', controller.ranking);
router.get('/event-loop', controller.eventLoop);

module.exports = router;
