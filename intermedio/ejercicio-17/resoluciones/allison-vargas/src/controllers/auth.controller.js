import * as service from '../services/auth.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaRegistro, esquemaLogin } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const registrar = catchAsync(async (req, res) => {
  const usuario = await service.registrar(validarCuerpo(req.body, esquemaRegistro));
  res.set('Location', `${req.baseUrl}/perfil`);
  enviar(res, usuario, 201);
});

export const iniciarSesion = catchAsync(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  enviar(res, await service.iniciarSesion(validarCuerpo(req.body, esquemaLogin)));
});

export const perfil = catchAsync((req, res) => enviar(res, service.perfil(req.usuario)));
