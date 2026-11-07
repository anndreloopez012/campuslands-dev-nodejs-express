"use strict";
const service = require("../services/domain.service");
module.exports =
  (op, status = 200) =>
  (req, res, next) =>
    Promise.resolve(
      service.execute(op, {
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
