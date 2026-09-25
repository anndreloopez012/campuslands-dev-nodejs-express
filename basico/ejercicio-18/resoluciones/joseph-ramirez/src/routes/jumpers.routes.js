const express = require("express");

const jumpersController = require("../controllers/jumpers.controller");

const router = express.Router();

router.get("/", jumpersController.getJumpers);

router.post("/", jumpersController.createJumper);

module.exports = router;