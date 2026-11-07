"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/arenas", controller("list", 200));
router.get("/metrics", controller("metrics", 200));
module.exports = router;
