import * as service from '../services/obras.service.js';
import { validarId } from '../validators/id.validator.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query, { soloPublicas: true })));

export const obtener = catchAsync((req, res) =>
  enviar(res, service.obtener(validarId(req.params.id), { soloPublicas: true })));
