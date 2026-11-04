import * as service from '../services/peliculas.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaPelicula } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

const conEnlaces = (req, pelicula) => ({
  ...pelicula,
  enlaces: {
    self: `${req.baseUrl}/${pelicula.id}`,
    resenas: `${req.baseUrl}/${pelicula.id}/resenas`,
    reparto: `${req.baseUrl}/${pelicula.id}/reparto`,
  },
});

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) =>
  enviar(res, conEnlaces(req, service.detalle(req.pelicula.id))));

export const crear = catchAsync((req, res) => {
  const pelicula = service.crear(validarCuerpo(req.body, esquemaPelicula));
  res.set('Location', `${req.baseUrl}/${pelicula.id}`);
  enviar(res, conEnlaces(req, service.detalle(pelicula.id)), 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaPelicula, { parcial: true });
  service.actualizar(req.pelicula.id, cambios);
  enviar(res, conEnlaces(req, service.detalle(req.pelicula.id)));
});

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.pelicula.id);
  res.status(204).end();
});
