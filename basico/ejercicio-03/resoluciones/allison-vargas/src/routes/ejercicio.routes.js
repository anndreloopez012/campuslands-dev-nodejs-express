const { Router } = require('express');
const { ejecutarEjercicio, obtenerCampeones } = require('../controllers/ejercicio.controller');

const router = Router();

// GET /basico/ejercicio-03
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-03/campeones
router.get('/campeones', obtenerCampeones);

module.exports = router;
