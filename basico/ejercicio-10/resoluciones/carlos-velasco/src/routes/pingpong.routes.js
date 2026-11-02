const express = require('express');
const pingpongController = require('../controllers/pingpong.controller');

const router = express.Router();

router.get('/pingpong', pingpongController.getPingPong);

module.exports = router;