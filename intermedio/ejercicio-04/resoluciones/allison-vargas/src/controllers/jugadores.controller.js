import * as service from '../services/jugadores.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, ...service.listar(req.query) }));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(req.params.id) }));

export const estadisticas = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtenerEstadisticas(req.params.id) }));
