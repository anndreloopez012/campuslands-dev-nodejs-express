"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/transfers", controller("transfer", 201));
router.get("/audit", controller("list", 200));
module.exports = router;
