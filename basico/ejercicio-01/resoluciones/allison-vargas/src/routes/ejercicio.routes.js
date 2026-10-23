const { Router } = require('express');
const { ejecutarEjercicio } = require('../controllers/ejercicio.controller');

const router = Router();

router.get('/', ejecutarEjercicio);

module.exports = router;
