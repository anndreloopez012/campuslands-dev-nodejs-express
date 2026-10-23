const { Router } = require('express');
const controller = require('../controllers/brushes.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-20', controller.info);
router.get('/middleware-order', controller.middlewareOrder);
router.post('/echo', controller.echo);
router.get('/brushes', controller.list);
router.post('/brushes', controller.create);

module.exports = router;
