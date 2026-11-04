import * as service from '../services/autos.service.js';
import { validarAuto, validarReserva, validarId } from '../validators/auto.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.listar(req.query.estado) }));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(validarId(req.params.id)) }));

export const crear = catchAsync((req, res) =>
  res.status(201).json({ ok: true, message: 'Auto creado', data: service.crear(validarAuto(req.body)) }));

export const reservar = catchAsync((req, res) =>
  res.status(200).json({
    ok: true,
    message: 'Auto reservado',
    data: service.reservar(validarId(req.params.id), validarReserva(req.body)),
  }));
