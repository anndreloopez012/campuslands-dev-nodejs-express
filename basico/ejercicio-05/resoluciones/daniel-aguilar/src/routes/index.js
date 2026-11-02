const { Router } = require('express');
const controller = require('../controllers/files.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-05', controller.info);
router.get('/matches', controller.matches);
router.get('/stadiums', controller.stadiums);
router.get('/files/:name', controller.fileInfo);

module.exports = router;
