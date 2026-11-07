"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.get("/auction", controller("current", 200));
router.post("/auction/bids", controller("bid", 201));
module.exports = router;
