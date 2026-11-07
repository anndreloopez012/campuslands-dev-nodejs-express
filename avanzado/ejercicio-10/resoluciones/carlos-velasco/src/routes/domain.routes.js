"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/records/csv", controller("parse", 200));
module.exports = router;
