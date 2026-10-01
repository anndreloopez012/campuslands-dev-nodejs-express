const express = require('express');
const hypercarController = require('../controllers/hypercar.controller');

const router = express.Router();

router.post('/hypercars', hypercarController.createHypercar);

module.exports = router;