const express = require('express');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.get('/players', playerController.getPlayers);
router.get('/players/:id', playerController.getPlayer);

module.exports = router;