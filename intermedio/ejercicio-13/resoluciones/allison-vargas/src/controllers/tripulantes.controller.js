import * as service from '../services/tripulantes.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaTripulante } from '../validators/schemas.js';
import { leerIncluirDetalle } from '../validators/consulta.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => {
  const incluir = leerIncluirDetalle(req.query, service.incluiblesTripulante);
  enviar(res, service.expandir(req.tripulante, incluir));
});

export const crear = catchAsync((req, res) => {
  const creado = service.crear(validarCuerpo(req.body, esquemaTripulante));
  res.set('Location', `${req.baseUrl}/${creado.id}`);
  enviar(res, service.expandir(creado), 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaTripulante, { parcial: true });
  enviar(res, service.expandir(service.actualizar(req.tripulante.id, cambios)));
});

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.tripulante.id);
  res.status(204).end();
});
