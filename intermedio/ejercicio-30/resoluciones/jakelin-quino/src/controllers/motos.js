const service = require('../services/motos');

exports.list = (_req, res) => res.json(service.list());
exports.create = (req, res) => {
  if (!req.body?.model || !Number.isInteger(req.body.year) || req.body.year < 1900) {
    return res.status(400).json({ error: 'Envía modelo y año válido' });
  }
  res.status(201).json(service.create(req.body));
};
