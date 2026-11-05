import * as proyectos from '../services/proyectos.service.js';
import * as subidas from '../services/subidas.service.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaSolicitudSubida } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, proyectos.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, proyectos.obtenerConUso(validarId(req.params.id))));

export const archivos = catchAsync((req, res) =>
  enviarListado(res, subidas.listarArchivos(validarId(req.params.id), req.query)));

export const solicitarSubida = catchAsync((req, res) => {
  const id = validarId(req.params.id);
  const datos = validarCuerpo(req.body, esquemaSolicitudSubida);
  const subida = subidas.solicitar(id, datos);
  res.set('Location', `/intermedio/ejercicio-22/subidas/${subida.id}`);
  enviar(res, {
    ...subida,
    urlSimulada: `https://almacen.simulado.test/${subida.nombreAlmacenado}`,
    siguientePaso: `POST /intermedio/ejercicio-22/subidas/${subida.id}/confirmar`,
  }, 201);
});
