import * as service from '../services/auth.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaRegistro, esquemaLogin, esquemaCambioPassword } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const registrar = catchAsync(async (req, res) => {
  const usuario = await service.registrar(validarCuerpo(req.body, esquemaRegistro));
  res.set('Location', `/intermedio/ejercicio-18/usuarios/${usuario.id}`);
  enviar(res, usuario, 201);
});

export const iniciarSesion = catchAsync(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  enviar(res, await service.iniciarSesion(validarCuerpo(req.body, esquemaLogin)));
});

export const cambiarPassword = catchAsync(async (req, res) => {
  await service.cambiarPassword(validarCuerpo(req.body, esquemaCambioPassword));
  res.status(204).end();
});
