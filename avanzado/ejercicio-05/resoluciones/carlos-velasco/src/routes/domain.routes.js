"use strict";
const express = require("express");
const controller = require("../controllers/controller");
const router = express.Router();
router.get("/inventory", controller("inventory", 200));
router.post("/purchases", controller("purchase", 201));
module.exports = router;
