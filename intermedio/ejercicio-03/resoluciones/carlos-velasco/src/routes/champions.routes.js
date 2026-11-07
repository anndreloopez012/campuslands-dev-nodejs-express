const { Router } = require('express');
const championsController = require('../controllers/champions.controller');

const router = Router();

router.get('/champions', championsController.listarCampeones);
router.get('/champions/:id', championsController.obtenerCampeon);
router.post('/champions', championsController.crearCampeon);
router.delete('/champions/:id', championsController.eliminarCampeon);

module.exports = router;
