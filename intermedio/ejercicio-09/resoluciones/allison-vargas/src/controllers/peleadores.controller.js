import * as service from '../services/peleadores.service.js';
import * as combatesService from '../services/combates.service.js';
import { validarId } from '../validators/id.validator.js';
import { responderListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  responderListado(req, res, service.listar(req.query)));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(validarId(req.params.id)) }));

export const listarCombates = catchAsync((req, res) =>
  responderListado(req, res, combatesService.listarPorPeleador(validarId(req.params.id), req.query)));
