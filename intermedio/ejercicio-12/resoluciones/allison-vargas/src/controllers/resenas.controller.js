import * as service from '../services/resenas.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaResena } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

const contexto = (pelicula) => ({ id: pelicula.id, titulo: pelicula.titulo });

export const listar = catchAsync((req, res) =>
  enviarListado(res, service.listar(req.pelicula.id, req.query), contexto(req.pelicula)));

export const obtener = catchAsync((req, res) => enviar(res, req.resena));

export const crear = catchAsync((req, res) => {
  const resena = service.crear(req.pelicula.id, validarCuerpo(req.body, esquemaResena));
  res.set('Location', `${req.baseUrl}/${resena.id}`);
  enviar(res, resena, 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaResena, { parcial: true });
  enviar(res, service.actualizar(req.pelicula.id, req.resena.id, cambios));
});

export const marcarUtil = catchAsync((req, res) =>
  enviar(res, service.marcarUtil(req.pelicula.id, req.resena.id)));

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.pelicula.id, req.resena.id);
  res.status(204).end();
});
