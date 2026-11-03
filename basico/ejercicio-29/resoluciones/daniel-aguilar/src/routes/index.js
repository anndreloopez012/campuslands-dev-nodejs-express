const { Router } = require('express');
const controller = require('../controllers/teams.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-29', controller.info);
router.get('/teams', controller.list);
router.get('/teams/:id', controller.detail);
router.post('/teams', controller.create);

module.exports = router;
