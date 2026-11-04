import * as service from '../services/canciones.service.js';
import { validarId } from '../validators/id.validator.js';
import { responderListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  responderListado(res, service.listar(req.query)));

export const sugerencias = catchAsync((req, res) => {
  const { q, sugerencias: lista } = service.sugerencias(req.query);
  res.status(200).json({ ok: true, data: lista, busqueda: { q, total: lista.length } });
});

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(validarId(req.params.id)) }));
