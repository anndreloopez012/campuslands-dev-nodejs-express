const express = require('express');
const { listPlayers } = require('../controllers/players.controller');
const router = express.Router();
router.get('/', listPlayers);
module.exports = router;
