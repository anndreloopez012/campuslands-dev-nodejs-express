const express = require('express');
const scifiController = require('../controllers/scifi.controller');

const router = express.Router();

router.get('/spaceships/:id', scifiController.getSpaceship);

module.exports = router;