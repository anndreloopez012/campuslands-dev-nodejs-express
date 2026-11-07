"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/reservations", controller("reserve", 201));
module.exports = router;
