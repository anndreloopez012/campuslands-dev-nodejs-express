"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/jobs", controller("add", 202));
router.get("/jobs", controller("list", 200));
router.post("/jobs/run", controller("run", 200));
module.exports = router;
