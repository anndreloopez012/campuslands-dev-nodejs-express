"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/openapi.json", controller("spec", 200));
router.get("/maps", controller("maps", 200));
module.exports = router;
