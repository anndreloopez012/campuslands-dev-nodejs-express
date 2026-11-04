import * as service from '../services/usuarios.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaUsuarioAdmin } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, req.usuarioObjetivo));

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaUsuarioAdmin, { parcial: true });
  enviar(res, service.actualizar(req.usuario, req.usuarioObjetivo.id, cambios));
});
