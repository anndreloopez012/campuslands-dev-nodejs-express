import * as service from '../services/cors.service.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const politicas = catchAsync((req, res) => enviar(res, service.describir()));
