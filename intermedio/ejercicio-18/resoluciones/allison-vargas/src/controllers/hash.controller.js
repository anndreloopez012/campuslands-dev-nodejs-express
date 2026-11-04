import * as service from '../services/hash.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaDemo, esquemaVerificar } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const parametros = catchAsync((req, res) => enviar(res, service.parametros()));

export const demo = catchAsync(async (req, res) => {
  enviar(res, await service.demo(validarCuerpo(req.body, esquemaDemo)));
});

export const comprobar = catchAsync(async (req, res) => {
  enviar(res, await service.comprobar(validarCuerpo(req.body, esquemaVerificar)));
});
