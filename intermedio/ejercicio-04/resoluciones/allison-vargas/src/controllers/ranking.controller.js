import * as service from '../services/ranking.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, ...service.obtenerRanking(req.query) }));
