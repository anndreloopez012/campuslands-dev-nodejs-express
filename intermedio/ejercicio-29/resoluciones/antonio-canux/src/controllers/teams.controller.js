import { teamsService } from '../services/teams.service.js';

// Capa HTTP: traduce req/res y delega en el servicio
export const list = (req, res) => {
  const data = teamsService.list(req.query.sport);
  res.status(200).json({ ok: true, total: data.length, data });
};

export const getOne = (req, res, next) => {
  try {
    res.status(200).json({ ok: true, data: teamsService.getById(Number(req.params.id)) });
  } catch (err) {
    next(err);
  }
};

export const create = (req, res, next) => {
  try {
    res.status(201).json({ ok: true, data: teamsService.create(req.body || {}) });
  } catch (err) {
    next(err);
  }
};
