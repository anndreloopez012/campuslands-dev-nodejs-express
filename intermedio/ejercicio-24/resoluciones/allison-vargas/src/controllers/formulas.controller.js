import { formulas } from '../services/index.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaConversion, esquemaEcuacion, esquemaFormula } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const analizar = catchAsync((req, res) =>
  enviar(res, formulas.analizar(validarCuerpo(req.body, esquemaFormula).formula)));

export const convertir = catchAsync((req, res) =>
  enviar(res, formulas.convertir(validarCuerpo(req.body, esquemaConversion))));

export const verificarEcuacion = catchAsync((req, res) =>
  enviar(res, formulas.verificarEcuacion(validarCuerpo(req.body, esquemaEcuacion).ecuacion)));
