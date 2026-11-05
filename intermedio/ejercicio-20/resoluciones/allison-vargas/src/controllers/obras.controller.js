import * as service from '../services/obras.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaObra } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));

export const crear = catchAsync((req, res) => {
  const creada = service.crear(validarCuerpo(req.body, esquemaObra));
  res.set('Location', `${req.baseUrl}/${creada.id}`);
  enviar(res, creada, 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaObra, { parcial: true });
  enviar(res, service.actualizar(validarId(req.params.id), cambios));
});

export const eliminar = catchAsync((req, res) => enviar(res, service.eliminar(validarId(req.params.id))));
