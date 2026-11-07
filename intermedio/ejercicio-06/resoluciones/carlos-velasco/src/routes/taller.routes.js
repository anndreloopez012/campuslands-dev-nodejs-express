const { Router } = require('express');
const tallerController = require('../controllers/taller.controller');
const validar = require('../validators/schema.validator');
const { motorSchema, ordenSchema } = require('../validators/moto.schemas');

const router = Router();

router.get('/motos', tallerController.listarMotos);
router.get('/motos/:id', tallerController.obtenerMoto);
router.post('/motos', validar(motorSchema), tallerController.crearMoto);
router.get('/ordenes', tallerController.listarOrdenes);
router.post('/ordenes', validar(ordenSchema), tallerController.crearOrden);

module.exports = router;
