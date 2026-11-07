const { Router } = require('express');
const studioController = require('../controllers/studio.controller');

const router = Router();

router.get('/servicios', studioController.listarServicios);
router.get('/info', studioController.infoEstudio);
router.post('/turnos', studioController.reservar);
router.delete('/turnos/:id', studioController.cancelar);

module.exports = router;
