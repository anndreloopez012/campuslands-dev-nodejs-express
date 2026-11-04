import * as service from '../services/hiperdeportivos.service.js';
import * as vueltasService from '../services/vueltas.service.js';
import { validarHiperdeportivo, validarVuelta, validarId } from '../validators/hiperdeportivo.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.listar(req.query) }));

export const obtener = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: service.obtener(validarId(req.params.id)) }));

export const crear = catchAsync((req, res) =>
  res.status(201).json({
    ok: true,
    message: 'Hiperdeportivo creado',
    data: service.crear(validarHiperdeportivo(req.body)),
  }));

export const listarVueltas = catchAsync((req, res) =>
  res.status(200).json({ ok: true, data: vueltasService.listarPorAuto(validarId(req.params.id)) }));

export const registrarVuelta = catchAsync((req, res) =>
  res.status(201).json({
    ok: true,
    message: 'Vuelta registrada',
    data: vueltasService.registrar(validarId(req.params.id), validarVuelta(req.body)),
  }));
