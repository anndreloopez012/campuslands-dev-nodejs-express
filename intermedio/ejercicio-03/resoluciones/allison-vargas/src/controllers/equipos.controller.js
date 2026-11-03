import * as service from '../services/equipos.service.js';
import { validarEquipo, validarJugador } from '../validators/equipo.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { enviar } from '../utils/respuesta.js';

export const listar = catchAsync((req, res) =>
  enviar(res, service.listar(req.query.region)));

export const obtener = catchAsync((req, res) =>
  enviar(res, service.obtener(req.params.id)));

export const crear = catchAsync((req, res) =>
  enviar(res, service.crear(validarEquipo(req.body)), 201, 'Equipo creado'));

export const actualizar = catchAsync((req, res) =>
  enviar(res, service.actualizar(req.params.id, validarEquipo(req.body)), 200, 'Equipo actualizado'));

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.params.id);
  res.status(204).send();
});

export const agregarJugador = catchAsync((req, res) =>
  enviar(res, service.agregarJugador(req.params.id, validarJugador(req.body)), 201, 'Jugador agregado'));
