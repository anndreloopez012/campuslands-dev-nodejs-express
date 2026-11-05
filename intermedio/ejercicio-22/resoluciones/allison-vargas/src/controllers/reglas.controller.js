import * as service from '../services/reglas.service.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const describir = catchAsync((req, res) => enviar(res, service.describir()));
