import * as service from '../services/pedidos.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { validarPedido } from '../validators/pedido.validator.js';
import { esquemaEstadoPedido } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.usuario, req.query)));

export const obtener = catchAsync((req, res) => {
  enviar(res, service.obtenerVisible(req.usuario, validarId(req.params.id)));
});

export const crear = catchAsync((req, res) => {
  const creado = service.crear(req.usuario, validarPedido(req.body));
  res.set('Location', `${req.baseUrl}/${creado.id}`);
  enviar(res, creado, 201);
});

export const cambiarEstado = catchAsync((req, res) => {
  const datos = validarCuerpo(req.body, esquemaEstadoPedido);
  enviar(res, service.cambiarEstado(req.usuario, validarId(req.params.id), datos));
});
