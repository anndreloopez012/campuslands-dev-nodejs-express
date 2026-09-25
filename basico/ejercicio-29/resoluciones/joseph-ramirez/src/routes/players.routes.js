const express = require("express");

const {
  getPlayers,
  getPlayer
} = require("../controllers/players.controller");

const router = express.Router();

router.get("/", getPlayers);
router.get("/:id", getPlayer);

module.exports = router;