const express = require("express");
const controller = require("./player.controller");

// El montaje base lo define el registro de modulos (/api/players),
// aqui solo se declaran las rutas internas del modulo.
const router = express.Router();

router.get("/", controller.listPlayers);
router.get("/leaderboard", controller.getLeaderboard);
router.get("/:id", controller.getPlayerById);
router.post("/", controller.createPlayer);

module.exports = router;
