const express = require('express');
const movieController = require('../controllers/movie.controller');

const router = express.Router();

router.get('/movies/:id', movieController.getMovie);

module.exports = router;