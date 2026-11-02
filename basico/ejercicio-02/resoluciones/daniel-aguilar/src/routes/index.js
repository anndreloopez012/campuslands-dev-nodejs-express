const { Router } = require('express');
const controller = require('../controllers/scripts.controller');

const router = Router();

router.get('/health', controller.health);
router.get('/basico/ejercicio-02', controller.info);
router.get('/scripts', controller.listScripts);
router.get('/scripts/:name', controller.getScript);

module.exports = router;
