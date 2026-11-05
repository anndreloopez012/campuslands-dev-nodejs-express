import * as service from '../services/calculos.service.js';
import * as catalogo from '../services/catalogo.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaCalculo } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const calor = catchAsync((req, res) => enviar(res, service.calcular(validarCuerpo(req.body, esquemaCalculo))));

export const catalogoCompleto = catchAsync((req, res) => enviar(res, catalogo.describir()));
