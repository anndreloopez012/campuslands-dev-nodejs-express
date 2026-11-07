const { Router } = require('express');
const hypercarController = require('../controllers/hypercar.controller');

const router = Router();

router.get('/hypercars', hypercarController.listarHiperdeportivos);
router.get('/hypercars/:id', hypercarController.obtenerHiperdeportivo);
router.post('/hypercars', hypercarController.registrarHiperdeportivo);

module.exports = router;
