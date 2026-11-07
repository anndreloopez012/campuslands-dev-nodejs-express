"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/equipment", controller("list", 200));
router.post("/equipment", controller("create", 201));
module.exports = router;
