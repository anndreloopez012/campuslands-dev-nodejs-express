const { Router } = require('express');
const tracksController = require('../controllers/tracks.controller');

const router = Router();

router.get('/tracks', tracksController.buscar);

module.exports = router;
