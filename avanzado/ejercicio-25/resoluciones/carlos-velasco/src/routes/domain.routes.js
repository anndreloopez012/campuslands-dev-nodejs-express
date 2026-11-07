"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/profiles", controller("list", 200));
router.post("/profiles", controller("create", 201));
module.exports = router;
