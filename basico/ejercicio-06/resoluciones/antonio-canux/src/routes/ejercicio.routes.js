const { Router } = require('express');
const { getEjercicio06 } = require('../controllers/ejercicio.controller');

const router = Router();

// Endpoint solicitado para el ejercicio 06
router.get('/basico/ejercicio-06', getEjercicio06);

module.exports = router;