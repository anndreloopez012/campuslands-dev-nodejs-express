const { Router } = require('express');
const controller = require('../controllers/campeones.controller');

const router = Router();

router.get('/', controller.principal);
router.get('/campeones', controller.listar);
router.get('/campeones/:id', controller.obtener);
router.get('/kda', controller.kda);

module.exports = router;
