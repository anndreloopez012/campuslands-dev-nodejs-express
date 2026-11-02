const { Router } = require('express');
const controller = require('../controllers/movies.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-12', controller.info);
router.get('/movies/:id', controller.detail);
router.get('/movies/:id/benchmark', controller.benchmark);

module.exports = router;
