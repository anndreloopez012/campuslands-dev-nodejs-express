"use strict";
const s = require("../services/transactions.service");
module.exports =
  (method, status = 200) =>
  (req, res, next) => {
    try {
      res.status(status).json({ data: s[method]({ body: req.body }) });
    } catch (e) {
      next(e);
    }
  };
