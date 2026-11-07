const { Router } = require('express');
const mapsController = require('../controllers/maps.controller');

const router = Router();

router.get('/', mapsController.listarMapas);
router.get('/:id', mapsController.obtenerMapa);
router.post('/', mapsController.crearMapa);

module.exports = router;
