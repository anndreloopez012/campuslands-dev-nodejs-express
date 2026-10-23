const { Router } = require('express');
const controller = require('../controllers/jumps.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-18', controller.info);
router.get('/jumps', controller.list);
router.get('/jumps/:id', controller.detail);
router.post('/jumps', controller.create);

module.exports = router;
