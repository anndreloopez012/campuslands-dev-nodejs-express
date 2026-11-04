import * as service from '../services/tours.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaTour } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.usuario, req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.vista(req.tour)));

export const crear = catchAsync((req, res) => {
  const creado = service.crear(req.usuario, validarCuerpo(req.body, esquemaTour));
  res.set('Location', `${req.baseUrl}/${creado.id}`);
  enviar(res, creado, 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaTour, { parcial: true });
  enviar(res, service.actualizar(req.usuario, req.tour, cambios));
});

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.usuario, req.tour);
  res.status(204).end();
});
