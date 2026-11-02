const express = require("express");

const skydivingController = require("../controllers/skydiving.controller");

const router = express.Router();

router.get("/", skydivingController.getJumps);

router.post("/", skydivingController.createJump);

module.exports = router;