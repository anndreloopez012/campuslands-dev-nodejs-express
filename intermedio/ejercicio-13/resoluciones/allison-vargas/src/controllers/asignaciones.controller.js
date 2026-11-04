import * as service from '../services/asignaciones.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaAsignacion } from '../validators/schemas.js';
import { validarId } from '../validators/id.validator.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listarPorMision = catchAsync((req, res) =>
  enviar(res, service.listarPorMision(req.mision.id)));

export const listarPorTripulante = catchAsync((req, res) =>
  enviar(res, service.listarPorTripulante(req.tripulante.id)));

export const asignar = catchAsync((req, res) => {
  const asignado = service.asignar(req.mision.id, validarCuerpo(req.body, esquemaAsignacion));
  res.set('Location', `${req.baseUrl}/${req.mision.id}/tripulantes/${asignado.id}`);
  enviar(res, asignado, 201);
});

export const desasignar = catchAsync((req, res) => {
  service.desasignar(req.mision.id, validarId(req.params.tripulanteId));
  res.status(204).end();
});
