"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/health/live", controller("live", 200));
router.get("/health/ready", controller("ready", 200));
module.exports = router;
