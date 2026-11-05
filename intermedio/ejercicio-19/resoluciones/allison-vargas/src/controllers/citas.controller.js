import * as service from '../services/citas.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaCita, esquemaEstadoCita } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));

export const crear = catchAsync((req, res) => {
  const creada = service.crear(validarCuerpo(req.body, esquemaCita));
  res.set('Location', `${req.baseUrl}/${creada.id}`);
  enviar(res, creada, 201);
});

export const cambiarEstado = catchAsync((req, res) => {
  const datos = validarCuerpo(req.body, esquemaEstadoCita);
  enviar(res, service.cambiarEstado(validarId(req.params.id), datos));
});
