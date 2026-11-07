"use strict";
const express = require("express"),
  controller = require("../controllers/controller");
const router = express.Router();
router.put("/cache/:key", controller("put", 200));
router.get("/cache/:key", controller("get", 200));
router.delete("/cache/:key", controller("delete", 200));
module.exports = router;
