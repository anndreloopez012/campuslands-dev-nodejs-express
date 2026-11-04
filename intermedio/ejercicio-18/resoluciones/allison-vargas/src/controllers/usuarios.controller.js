import * as service from '../services/usuarios.service.js';
import { validarId } from '../validators/id.validator.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));
