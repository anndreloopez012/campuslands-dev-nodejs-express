const { Router } = require('express');
const { getEjercicioBasico } = require('../controllers/rpg.controller');

const router = Router();

// Definimos la ruta exacta que pide el requerimiento
router.get('/basico/ejercicio-01', getEjercicioBasico);

module.exports = router;