const { Router } = require('express');
const controller = require('../controllers/loadouts.controller');
const { requireApiKey, requireAdmin } = require('../middlewares/auth');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-26', controller.info);
router.get('/status-guide', controller.statusGuide);

router.get('/loadouts', controller.list);
router.get('/loadouts/:id', controller.detail);
router.post('/loadouts', requireApiKey, controller.create);
router.delete('/loadouts/:id', requireApiKey, requireAdmin, controller.remove);

router.get('/admin/stats', requireApiKey, requireAdmin, controller.adminStats);
router.get('/matchmaking', controller.matchmaking);
router.get('/debug/error', controller.debugError);

module.exports = router;
