"use strict";
const r = require("express").Router(),
  c = require("../controllers/controller");
r.post("/jobs", c("enqueue"));
r.get("/jobs", c("list"));
r.post("/jobs/run", c("run"));
module.exports = r;
