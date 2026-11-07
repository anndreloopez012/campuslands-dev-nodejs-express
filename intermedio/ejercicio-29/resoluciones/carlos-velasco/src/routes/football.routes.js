const { Router } = require('express');
const footballController = require('../controllers/football.controller');

const router = Router();

router.get('/equipos', footballController.listarEquipos);
router.post('/equipos', footballController.crearEquipo);
router.delete('/equipos/:id', footballController.borrarEquipo);
router.get('/equipos/:id/plantilla', footballController.listarPlantilla);
router.post('/equipos/:id/jugadores', footballController.crearJugador);

module.exports = router;
