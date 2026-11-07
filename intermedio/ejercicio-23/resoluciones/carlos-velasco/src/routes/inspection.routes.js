const { Router } = require('express');
const inspectionController = require('../controllers/inspection.controller');

const router = Router();

router.get('/inspecciones', inspectionController.listarInspecciones);
router.get('/inspecciones/:id', inspectionController.consultarInspeccion);
router.post('/inspecciones', inspectionController.registrarInspeccion);

module.exports = router;
