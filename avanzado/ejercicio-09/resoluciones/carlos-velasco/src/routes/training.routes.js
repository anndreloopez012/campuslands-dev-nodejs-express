const express = require('express');
const trainingController = require('../controllers/training.controller');

const router = express.Router();

router.get('/training-sessions', trainingController.getTrainingSessions);

module.exports = router;