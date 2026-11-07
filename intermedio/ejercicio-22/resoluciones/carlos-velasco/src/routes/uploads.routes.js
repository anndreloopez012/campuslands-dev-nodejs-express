const { Router } = require('express');
const uploadsController = require('../controllers/uploads.controller');

const router = Router();

router.get('/modelos', uploadsController.listarModelos);
router.post('/modelos', uploadsController.iniciarSubida);
router.post('/modelos/:id/chunks', uploadsController.enviarChunk);

module.exports = router;
