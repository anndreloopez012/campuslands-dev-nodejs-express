"use strict";
const s = require("../services/domain.service");
module.exports =
  (method, status = 200) =>
  (req, res, next) =>
    Promise.resolve()
      .then(() =>
        s[method]({
          body: req.body || {},
          params: req.params,
          query: req.query,
          headers: req.headers,
          req,
          res,
          actor: req.get("x-role") || req.get("x-actor") || "anonymous",
          logger: req.log,
          requestId: req.id,
        }),
      )
      .then((data) => {
        if (!res.headersSent && data !== undefined)
          res.status(status).json({ data });
      })
      .catch(next);
