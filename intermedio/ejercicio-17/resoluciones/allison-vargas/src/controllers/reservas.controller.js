import * as service from '../services/reservas.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaReserva, esquemaEstadoReserva } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.usuario, req.query)));

export const obtener = catchAsync((req, res) => {
  enviar(res, service.obtenerVisible(req.usuario, validarId(req.params.id)));
});

export const crear = catchAsync((req, res) => {
  const creada = service.crear(req.usuario, validarCuerpo(req.body, esquemaReserva));
  res.set('Location', `${req.baseUrl}/${creada.id}`);
  enviar(res, creada, 201);
});

export const cambiarEstado = catchAsync((req, res) => {
  const datos = validarCuerpo(req.body, esquemaEstadoReserva);
  enviar(res, service.cambiarEstado(req.usuario, validarId(req.params.id), datos));
});
