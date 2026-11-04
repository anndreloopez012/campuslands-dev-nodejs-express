import * as service from '../services/motos.service.js';
import { motoTieneOrdenes } from '../services/ordenes.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.listar(req.query) }));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(req.params.id) }));

export const crear = catchAsync((req, res) =>
  res.status(201).json({ ok: true, message: 'Moto creada', data: service.crear(req.body) }));

export const actualizar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, message: 'Moto actualizada', data: service.actualizar(req.params.id, req.body) }));

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.params.id, motoTieneOrdenes(req.params.id));
  res.status(204).send();
});
