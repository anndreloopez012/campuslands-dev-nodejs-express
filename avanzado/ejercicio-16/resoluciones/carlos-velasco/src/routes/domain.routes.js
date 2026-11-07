"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/announcements", controller("create", 201));
router.get("/announcements", controller("list", 200));
module.exports = router;
