import * as service from '../services/menu.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaPlato } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, req.plato));

export const crear = catchAsync((req, res) => {
  const creado = service.crear(validarCuerpo(req.body, esquemaPlato));
  res.set('Location', `${req.baseUrl}/${creado.id}`);
  enviar(res, creado, 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaPlato, { parcial: true });
  enviar(res, service.actualizar(req.plato.id, cambios));
});

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.plato.id);
  res.status(204).end();
});
