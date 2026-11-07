const { Router } = require('express');
const matchesController = require('../controllers/matches.controller');

const router = Router();

router.get('/', matchesController.listarPartidas);
router.get('/:id', matchesController.obtenerPartida);
router.post('/', matchesController.crearPartida);

module.exports = router;
