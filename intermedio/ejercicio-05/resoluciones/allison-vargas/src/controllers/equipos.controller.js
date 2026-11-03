import * as service from '../services/equipos.service.js';
import { validarEquipo } from '../validators/equipo.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.listar(req.query.deporte) }));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(req.params.id) }));

export const listarJugadores = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.listarJugadores(req.params.id) }));

export const crear = catchAsync((req, res) =>
  res.status(201).json({ ok: true, message: 'Equipo creado', data: service.crear(validarEquipo(req.body)) }));

export const actualizar = catchAsync((req, res) =>
  res.status(200).json({
    ok: true,
    message: 'Equipo actualizado',
    data: service.actualizar(req.params.id, validarEquipo(req.body)),
  }));

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.params.id);
  res.status(204).send();
});
