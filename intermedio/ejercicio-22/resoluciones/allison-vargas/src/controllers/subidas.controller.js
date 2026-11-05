import * as service from '../services/subidas.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaConfirmacion } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));

export const confirmar = catchAsync((req, res) => {
  const id = validarId(req.params.id);
  enviar(res, service.confirmar(id, validarCuerpo(req.body, esquemaConfirmacion)));
});

export const eliminar = catchAsync((req, res) => enviar(res, service.eliminar(validarId(req.params.id))));
