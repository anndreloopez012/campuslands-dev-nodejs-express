const { Router } = require('express');
const chemistryController = require('../controllers/chemistry.controller');

const router = Router();

router.post('/analisis', chemistryController.analizar);
router.get('/analisis', chemistryController.listarMediciones);
router.get('/analisis/:id', chemistryController.consultarMedicion);

module.exports = router;
