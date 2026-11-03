const service = require('../services/teams');

exports.list = (_req, res) => res.json(service.list());
exports.create = (req, res) => {
  if (!req.body?.name) return res.status(400).json({ error: 'Falta el nombre' });
  res.status(201).json(service.create(req.body.name));
};
