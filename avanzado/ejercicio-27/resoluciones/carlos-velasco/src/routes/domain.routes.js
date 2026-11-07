"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/config", controller("getConfig", 200));
module.exports = router;
