"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/sessions", controller("create", 201));
router.post("/sessions/refresh", controller("refresh", 200));
router.post("/sessions/revoke", controller("revoke", 200));
module.exports = router;
