const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const travelController = require('../controllers/travel.controller');
const { requireAuth, requirePermiso } = require('../middlewares/auth.guard');

const router = Router();

// Publico
router.post('/auth/login', authController.login);
router.get('/paquetes', travelController.listarPaquetes);

// Protegido: cualquier usuario autenticado puede reservar a su nombre
router.post('/reservas', requireAuth, travelController.crearReserva);

// La ruta declara una ACCION de la matriz: ver reservas es distinta para turista/agente
router.get('/reservas', requireAuth, requirePermiso('reservas:ver-propia'), travelController.listarReservas);

// Cancelar: se resuelve adentro propia vs cualquiera
router.delete('/reservas/:id', requireAuth, requirePermiso('reservas:cancelar-propia'), travelController.cancelarReserva);

module.exports = router;
