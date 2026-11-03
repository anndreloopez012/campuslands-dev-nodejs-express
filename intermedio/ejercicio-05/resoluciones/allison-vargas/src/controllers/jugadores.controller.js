import * as service from '../services/jugadores.service.js';
import { validarJugador, validarFiltroEquipo } from '../validators/jugador.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.listar(validarFiltroEquipo(req.query.equipoId)) }));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(req.params.id) }));

export const crear = catchAsync((req, res) =>
  res.status(201).json({ ok: true, message: 'Jugador creado', data: service.crear(validarJugador(req.body)) }));

export const actualizar = catchAsync((req, res) =>
  res.status(200).json({
    ok: true,
    message: 'Jugador actualizado',
    data: service.actualizar(req.params.id, validarJugador(req.body)),
  }));

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.params.id);
  res.status(204).send();
});
