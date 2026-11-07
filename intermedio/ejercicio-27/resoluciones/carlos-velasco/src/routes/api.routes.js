const { Router } = require('express');
const championsController = require('../controllers/champions.controller');
const matchesController = require('../controllers/matches.controller');

const router = Router();

router.get('/campeones', championsController.listarCampeones);
router.get('/campeones/:id', championsController.obtenerCampeon);
router.post('/campeones', championsController.crearCampeon);
router.get('/partidas', matchesController.listarPartidas);
router.post('/partidas', matchesController.crearPartida);

module.exports = router;
