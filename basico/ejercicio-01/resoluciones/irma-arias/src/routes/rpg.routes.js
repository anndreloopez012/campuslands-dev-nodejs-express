
const { Router } = require('express');
const rpgController = require('../controllers/rpg.controller');

const router = Router();

router.get('/health', rpgController.verificarEstado);

module.exports = router;