import * as service from '../services/armas.service.js';

export const listar = (req, res) => {
  res.status(200).json({ ok: true, data: service.listar(req.query.tipo) });
};

export const obtener = (req, res, next) => {
  try {
    res.status(200).json({ ok: true, data: service.obtener(req.params.id) });
  } catch (error) {
    next(error);
  }
};
