const express = require('express');
const musicController = require('../controllers/music.controller');

const router = express.Router();

router.get('/songs/:id', musicController.getSong);

module.exports = router;