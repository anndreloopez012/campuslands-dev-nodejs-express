import * as service from '../services/usuarios.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaRol } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));

export const cambiarRol = catchAsync((req, res) => {
  const datos = validarCuerpo(req.body, esquemaRol);
  enviar(res, service.cambiarRol(req.usuario, validarId(req.params.id), datos));
});
