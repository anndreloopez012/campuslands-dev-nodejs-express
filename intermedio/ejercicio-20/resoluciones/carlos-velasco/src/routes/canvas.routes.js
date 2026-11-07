const { Router } = require('express');
const canvasController = require('../controllers/canvas.controller');

const router = Router();

router.get('/lienzos', canvasController.listarLienzos);
router.post('/lienzos', canvasController.crearLienzo);
router.patch('/lienzos/:id', canvasController.actualizarTitulo);

module.exports = router;
