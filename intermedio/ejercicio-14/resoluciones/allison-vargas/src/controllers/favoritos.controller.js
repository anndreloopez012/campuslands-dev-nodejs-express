import * as service from '../services/favoritos.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaFavorito } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.usuario.id, req.query)));

export const obtener = catchAsync((req, res) => {
  enviar(res, service.detalle(req.usuario.id, validarId(req.params.libroId)));
});

export const agregar = catchAsync((req, res) => {
  const { libroId } = validarCuerpo(req.body, esquemaFavorito);
  const creado = service.agregar(req.usuario.id, libroId);
  res.set('Location', `${req.baseUrl}/${libroId}`);
  enviar(res, creado, 201);
});

export const quitar = catchAsync((req, res) => {
  service.quitar(req.usuario.id, validarId(req.params.libroId));
  res.status(204).end();
});
