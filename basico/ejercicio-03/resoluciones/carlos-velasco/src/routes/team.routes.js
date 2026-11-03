const express = require("express");

const {
    getTeams,
    getTeam,
    createNewTeam
} = require("../controllers/team.controller");

const router = express.Router();

router.get("/", getTeams);
router.get("/:id", getTeam);
router.post("/", createNewTeam);

module.exports = router;