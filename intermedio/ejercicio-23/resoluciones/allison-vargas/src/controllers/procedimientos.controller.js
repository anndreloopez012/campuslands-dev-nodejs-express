import * as service from '../services/procedimientos.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaProcedimiento } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));

export const crear = catchAsync((req, res) => {
  const creado = service.crear(validarCuerpo(req.body, esquemaProcedimiento));
  res.set('Location', `${req.baseUrl}/${creado.id}`);
  enviar(res, creado, 201);
});

export const aprobar = catchAsync((req, res) => enviar(res, service.aprobar(validarId(req.params.id))));
