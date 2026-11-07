"use strict";
const r = require("express").Router(),
  c = require("../controllers/controller");
r.get("/items", c("list"));
r.post("/items", c("create", 201));
r.get("/metadata", c("metadata"));
module.exports = r;
