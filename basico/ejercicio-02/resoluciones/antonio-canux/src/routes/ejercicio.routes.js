const { Router } = require('express');
const { getEjercicio02 } = require('../controllers/ejercicio.controller');

const router = Router();

// Endpoint específico para el ejercicio 02
router.get('/basico/ejercicio-02', getEjercicio02);

module.exports = router;