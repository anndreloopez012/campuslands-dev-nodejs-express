const { Router } = require('express');
const system = require('../controllers/system.controller');
const animationsRoutes = require('./animations.routes');
const charactersRoutes = require('./characters.routes');

// Punto unico donde se registran todas las rutas de la aplicacion.
const router = Router();

router.get('/health', system.health);
router.get('/basico/ejercicio-21', system.info);
router.use('/animations', animationsRoutes);
router.use('/characters', charactersRoutes);

module.exports = router;
