import * as service from '../services/partidas.service.js';
import { validarPartida } from '../validators/partida.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, ...service.listar(req.query) }));

export const registrar = catchAsync((req, res) =>
  res.status(201).json({
    ok: true,
    message: 'Partida registrada',
    data: service.registrar(validarPartida(req.body)),
  }));
