const express = require("express");

const teamsController = require("../controllers/teams.controller");

const router = express.Router();

router.get("/", teamsController.getTeams);

module.exports = router;