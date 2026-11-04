import * as service from '../services/artistas.service.js';
import { responderListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  responderListado(res, service.listar(req.query)));
