"use strict";
const r = require("express").Router(),
  c = require("../controllers/controller.factory");
r.get("/inventory", c("inventory"));
r.post("/purchases", c("purchase", 201));
module.exports = r;
