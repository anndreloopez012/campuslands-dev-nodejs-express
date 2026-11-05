import * as service from '../services/config.service.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const publica = catchAsync((req, res) => enviar(res, service.publica()));

export const completa = catchAsync((req, res) => enviar(res, service.completa()));
