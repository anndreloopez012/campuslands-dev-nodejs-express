const express = require('express');

const { getTeams } = require('../controllers/teams.js');

const router = express.Router();

router.get('/teams', getTeams);

module.exports = router;