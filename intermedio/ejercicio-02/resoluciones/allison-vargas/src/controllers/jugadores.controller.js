import * as service from '../services/jugadores.service.js';
import { validarJugador } from '../validators/jugador.validator.js';
import { AppError } from '../utils/AppError.js';

export const listar = (req, res) => {
  res.status(200).json({ ok: true, data: service.listar(req.query.rango) });
};

export const obtener = (req, res, next) => {
  try {
    res.status(200).json({ ok: true, data: service.obtener(req.params.id) });
  } catch (error) {
    next(error);
  }
};

export const crear = (req, res, next) => {
  try {
    const { valido, errores, datos } = validarJugador(req.body);
    if (!valido) throw new AppError(errores.join('. '), 400);
    res.status(201).json({ ok: true, data: service.crear(datos) });
  } catch (error) {
    next(error);
  }
};
