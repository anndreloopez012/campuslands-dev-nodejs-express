import * as service from '../services/reparto.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaReparto } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

const contexto = (pelicula) => ({ id: pelicula.id, titulo: pelicula.titulo });

export const listar = catchAsync((req, res) =>
  enviarListado(res, service.listar(req.pelicula.id, req.query), contexto(req.pelicula)));

export const obtener = catchAsync((req, res) => enviar(res, req.miembro));

export const crear = catchAsync((req, res) => {
  const miembro = service.crear(req.pelicula.id, validarCuerpo(req.body, esquemaReparto));
  res.set('Location', `${req.baseUrl}/${miembro.id}`);
  enviar(res, miembro, 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaReparto, { parcial: true });
  enviar(res, service.actualizar(req.pelicula.id, req.miembro.id, cambios));
});

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.pelicula.id, req.miembro.id);
  res.status(204).end();
});
