import * as service from '../services/favoritos.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaFavorito } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.usuario, req.query)));

export const agregar = catchAsync((req, res) => {
  const creado = service.agregar(req.usuario, validarCuerpo(req.body, esquemaFavorito));
  enviar(res, creado, 201);
});

export const quitar = catchAsync((req, res) => {
  service.quitar(req.usuario, validarId(req.params.productoId));
  res.status(204).end();
});
