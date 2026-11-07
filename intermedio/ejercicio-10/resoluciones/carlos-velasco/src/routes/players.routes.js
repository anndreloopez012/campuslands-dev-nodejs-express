const { Router } = require('express');
const playersController = require('../controllers/players.controller');

const router = Router();

router.get('/players', playersController.listarJugadoresEndpoint);

module.exports = router;
