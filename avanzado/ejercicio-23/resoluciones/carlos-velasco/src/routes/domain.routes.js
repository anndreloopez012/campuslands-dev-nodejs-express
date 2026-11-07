"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/jobs", controller("list", 200));
router.post("/jobs/:name/run", controller("run", 200));
module.exports = router;
