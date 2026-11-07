"use strict";
module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  res
    .status(status)
    .json({
      error: {
        code:
          error.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
        message: status === 500 ? "Error interno del servidor" : error.message,
      },
      requestId: req.id,
    });
};
