const { Router } = require('express');
const controller = require('../controllers/fighters.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-09', controller.info);
router.get('/fighters', controller.list);
router.get('/fighters/:id', controller.detail);
router.post('/fighters', controller.create);

module.exports = router;
