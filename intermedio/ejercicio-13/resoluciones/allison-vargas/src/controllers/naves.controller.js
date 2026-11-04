import * as service from '../services/naves.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { esquemaNave } from '../validators/schemas.js';
import { leerIncluirDetalle } from '../validators/consulta.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => {
  const incluir = leerIncluirDetalle(req.query, service.incluiblesNave);
  enviar(res, service.expandir(req.nave, incluir));
});

export const crear = catchAsync((req, res) => {
  const creado = service.crear(validarCuerpo(req.body, esquemaNave));
  res.set('Location', `${req.baseUrl}/${creado.id}`);
  enviar(res, service.expandir(creado), 201);
});

export const actualizar = catchAsync((req, res) => {
  const cambios = validarCuerpo(req.body, esquemaNave, { parcial: true });
  enviar(res, service.expandir(service.actualizar(req.nave.id, cambios)));
});

export const eliminar = catchAsync((req, res) => {
  service.eliminar(req.nave.id);
  res.status(204).end();
});
