"use strict";
const express = require("express");
const crypto = require("node:crypto");
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.set("x-request-id", req.id);
  next();
});
app.get("/health", (_req, res) => res.json({ data: { status: "ok" } }));
app.use(require("./routes/domain.routes"));
app.use((req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Ruta no encontrada" } }));
app.use(require("./middlewares/error"));
module.exports = app;
