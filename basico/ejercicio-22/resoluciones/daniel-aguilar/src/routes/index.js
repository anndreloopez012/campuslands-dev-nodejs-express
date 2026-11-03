const { Router } = require('express');
const controller = require('../controllers/projects.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-22', controller.info);
router.get('/summary', controller.summary);
router.get('/projects', controller.list);
router.get('/projects/:id', controller.detail);
router.get('/projects/:id/render-estimate', controller.renderEstimate);
router.post('/projects', controller.create);

module.exports = router;
