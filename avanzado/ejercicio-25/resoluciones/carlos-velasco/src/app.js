"use strict";
const express = require("express"),
  crypto = require("node:crypto");
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.set("x-request-id", req.id);
  req.log = {
    info: (meta, message) =>
      console.log(JSON.stringify({ level: "info", message, ...meta })),
  };
  next();
});
app.get("/health", (_q, r) => r.json({ data: { status: "ok" } }));
app.use(require("./routes/domain.routes"));
app.use((q, r) =>
  r
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Ruta no encontrada" } }),
);
app.use((e, q, r, n) => {
  if (r.headersSent) return n(e);
  const status = e.status || 500;
  r.status(status).json({
    error: {
      code: e.code || "INTERNAL_ERROR",
      message: status === 500 ? "Error interno" : e.message,
    },
    requestId: q.id,
  });
});
module.exports = app;
