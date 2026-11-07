"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/expeditions", controller("list", 200));
router.post("/expeditions", controller("create", 201));
router.post("/expeditions/:id/complete", controller("complete", 200));
router.get("/audit", controller("audit", 200));
module.exports = router;
