"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/records/import", controller("import", 200));
router.get("/records", controller("list", 200));
module.exports = router;
