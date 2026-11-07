const { Router } = require('express');
const matchesController = require('../controllers/matches.controller');

const router = Router();

router.post('/matches', matchesController.crearPartida);
router.get('/matches', matchesController.listarPartidas);
router.get('/maps', matchesController.listarMapas);
router.get('/maps/:id', matchesController.obtenerMapa);

module.exports = router;
