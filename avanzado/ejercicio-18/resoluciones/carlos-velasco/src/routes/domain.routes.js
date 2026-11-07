"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/missions", controller("list", 200));
router.post("/missions", controller("create", 201));
module.exports = router;
