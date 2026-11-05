import * as service from '../services/escenas.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaEscena } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));

export const crear = catchAsync((req, res) => {
  const creada = service.crear(validarCuerpo(req.body, esquemaEscena));
  res.set('Location', `${req.baseUrl}/${creada.id}`);
  enviar(res, creada, 201);
});

export const render = catchAsync((req, res) => enviar(res, service.enviarARender(validarId(req.params.id)), 202));
