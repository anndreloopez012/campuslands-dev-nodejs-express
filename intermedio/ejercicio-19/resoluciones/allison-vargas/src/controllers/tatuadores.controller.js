import * as service from '../services/tatuadores.service.js';
import * as citas from '../services/citas.service.js';
import { validarId } from '../validators/id.validator.js';
import { ValidationError } from '../utils/errors.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, service.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, service.obtener(validarId(req.params.id))));

export const horarios = catchAsync((req, res) => {
  const id = service.obtener(validarId(req.params.id)).id;
  const { fecha, ...resto } = req.query;
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Object.keys(resto).length) {
    throw new ValidationError('Parametros de consulta invalidos', [{ campo: 'fecha', mensaje: 'es obligatoria con formato AAAA-MM-DD (unico parametro permitido)' }], 'CONSULTA_INVALIDA');
  }
  enviar(res, citas.horarios(fecha, id));
});
