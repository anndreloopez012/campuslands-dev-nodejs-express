const { Router } = require('express');
const equiposController = require('../controllers/equipos.controller');

const router = Router();

router.get('/equipos', equiposController.listarEquipos);
router.get('/equipos/:id', equiposController.obtenerEquipo);
router.post('/equipos', equiposController.crearEquipo);
router.put('/equipos/:id', equiposController.actualizarEquipo);
router.delete('/equipos/:id', equiposController.eliminarEquipo);

module.exports = router;
