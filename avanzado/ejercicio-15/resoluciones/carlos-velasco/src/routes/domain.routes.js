"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/profile", controller("profile", 200));
module.exports = router;
