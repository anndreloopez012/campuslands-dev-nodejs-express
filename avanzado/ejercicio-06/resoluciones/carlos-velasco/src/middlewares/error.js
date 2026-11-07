module.exports = (e, q, r, n) => {
  if (r.headersSent) return n(e);
  r.status(e.status || 500).json({
    error: {
      code: e.code || "INTERNAL_ERROR",
      message: e.status ? e.message : "Error interno",
    },
  });
};
