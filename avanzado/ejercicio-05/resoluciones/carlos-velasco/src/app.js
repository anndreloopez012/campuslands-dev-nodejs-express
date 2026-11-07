"use strict";
const express = require("express"),
  crypto = require("node:crypto");
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.set("x-request-id", req.id);
  next();
});
app.get("/health", (_q, r) => r.json({ data: { status: "ok" } }));
app.use(require("./routes/exercise.routes"));
app.use((e, q, r, n) => {
  if (r.headersSent) return n(e);
  const s = e.status || 500;
  r.status(s).json({
    error: {
      code: e.code || "INTERNAL_ERROR",
      message: s === 500 ? "Error interno" : e.message,
    },
    requestId: q.id,
  });
});
module.exports = app;
