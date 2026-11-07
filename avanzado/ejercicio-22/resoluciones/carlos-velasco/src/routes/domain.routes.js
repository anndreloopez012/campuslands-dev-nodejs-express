"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.post("/webhooks", controller("register", 201));
router.post("/webhooks/:id/dispatch", controller("dispatch", 200));
router.get("/webhooks/:id/deliveries", controller("deliveries", 200));
module.exports = router;
