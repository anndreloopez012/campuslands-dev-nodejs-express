const express = require("express");
const songsController = require("../controllers/songs.controller");

const router = express.Router();

router.get("/", songsController.getSongs);

router.get("/genre/:genre", songsController.getSongsByGenre);

router.get("/:id", songsController.getSongById);

module.exports = router;