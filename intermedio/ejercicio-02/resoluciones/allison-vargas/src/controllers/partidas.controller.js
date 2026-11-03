import * as service from '../services/partidas.service.js';
import { validarPartida } from '../validators/partida.validator.js';
import { AppError } from '../utils/AppError.js';

export const listar = (req, res) => {
  res.status(200).json({ ok: true, data: service.listar() });
};

export const crear = (req, res, next) => {
  try {
    const { valido, errores, datos } = validarPartida(req.body);
    if (!valido) throw new AppError(errores.join('. '), 400);
    res.status(201).json({ ok: true, data: service.crear(datos) });
  } catch (error) {
    next(error);
  }
};
