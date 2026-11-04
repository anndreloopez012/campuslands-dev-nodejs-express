import * as service from '../services/admin.service.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const resumen = catchAsync((req, res) => enviar(res, service.resumen()));

export const usuarios = catchAsync((req, res) => enviarListado(res, service.listarUsuarios(req.query)));
