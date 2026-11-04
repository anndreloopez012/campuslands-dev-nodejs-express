import * as service from '../services/jugadores.service.js';
import * as partidosService from '../services/partidos.service.js';
import { validarId } from '../validators/id.validator.js';
import { responderListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  responderListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(validarId(req.params.id)) }));

export const listarPartidos = catchAsync((req, res) =>
  responderListado(res, partidosService.listarPorJugador(validarId(req.params.id), req.query)));
