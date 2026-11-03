const service = require('../services/players');

exports.list = (_req, res) => res.json(service.list());
