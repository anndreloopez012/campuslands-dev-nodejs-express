const { Router } = require('express');
const { getEjercicio03 } = require('../controllers/ejercicio.controller');

const router = Router();

// Endpoint específico para el ejercicio 03
router.get('/basico/ejercicio-03', getEjercicio03);

module.exports = router;