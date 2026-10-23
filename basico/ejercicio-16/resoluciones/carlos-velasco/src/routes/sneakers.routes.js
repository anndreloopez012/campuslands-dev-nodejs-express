const express = require('express');

const sneakersController = require('../controllers/sneakers.controller');

const router = express.Router();

router.get('/', sneakersController.getSneakers);
router.get('/:id', sneakersController.getSneakerById);

module.exports = router;