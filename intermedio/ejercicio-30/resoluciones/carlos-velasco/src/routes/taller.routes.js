const { Router } = require('express');
const tallerController = require('../controllers/taller.controller');

const router = Router();

router.get('/motos', tallerController.listarMotos);
router.get('/motos/:id', tallerController.obtenerMoto);
router.post('/motos', tallerController.registrarMoto);

router.get('/ordenes', tallerController.listarOrdenes);
router.post('/ordenes', tallerController.abrirOrden);
router.post('/ordenes/:id/estado', tallerController.cambiarEstado);

router.get('/repuestos', tallerController.listarRepuestos);
router.post('/repuestos/:id/stock', tallerController.moverStock);

module.exports = router;
