const { Router } = require('express');
const { getEjercicio05 } = require('../controllers/ejercicio.controller');

const router = Router();

// Endpoint específico para el ejercicio 05
router.get('/basico/ejercicio-05', getEjercicio05);

module.exports = router;