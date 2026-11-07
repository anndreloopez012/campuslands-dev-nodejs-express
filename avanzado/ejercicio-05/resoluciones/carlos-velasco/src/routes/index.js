"use strict";
const express = require("express"),
  ctrl = require("../controllers/controller");
const router = express.Router();
router.get("/inventory", ctrl("list", 200));
router.post("/purchases", ctrl("create", 201));
module.exports = router;
