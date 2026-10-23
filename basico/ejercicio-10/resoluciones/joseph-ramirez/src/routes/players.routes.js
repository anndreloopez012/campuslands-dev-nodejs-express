const express = require("express");
const playersController = require("../controllers/players.controller");

const router = express.Router();

router.get("/", playersController.getPlayers);

router.get("/country/:country", playersController.getPlayersByCountry);

router.get("/:id", playersController.getPlayerById);

module.exports = router;