import * as service from '../services/ordenes.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.listar(req.query) }));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(req.params.id) }));

export const crear = catchAsync((req, res) =>
  res.status(201).json({ ok: true, message: 'Orden creada', data: service.crear(req.body) }));

export const cambiarEstado = catchAsync((req, res) =>
  res.status(200).json({ ok: true, message: 'Estado actualizado', data: service.cambiarEstado(req.params.id, req.body) }));
