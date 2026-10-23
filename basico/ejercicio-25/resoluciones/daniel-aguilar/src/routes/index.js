const { Router } = require('express');
const controller = require('../controllers/quests.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-25', controller.info);
router.get('/quests', controller.list);
router.get('/quests/:id', controller.detail);
router.post('/quests', controller.create);
router.patch('/quests/:id/complete', controller.complete);
router.delete('/quests/:id', controller.remove);

module.exports = router;
