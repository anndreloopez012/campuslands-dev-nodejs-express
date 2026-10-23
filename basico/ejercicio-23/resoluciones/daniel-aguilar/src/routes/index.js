const { Router } = require('express');
const controller = require('../controllers/welds.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-23', controller.info);
router.get('/welds', controller.list);
router.get('/welds/stats', controller.stats);
router.get('/welds/:id', controller.detail);
router.post('/welds', controller.create);
router.post('/admin/reset', controller.reset);

module.exports = router;
