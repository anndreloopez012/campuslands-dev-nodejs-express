"use strict";
module.exports = (e, q, r, n) => {
  if (r.headersSent) return n(e);
  const status = e.status || 500;
  r.status(status).json({
    error: {
      code: e.code || "INTERNAL_ERROR",
      message: status === 500 ? "Error interno" : e.message,
    },
    requestId: q.id,
  });
};
