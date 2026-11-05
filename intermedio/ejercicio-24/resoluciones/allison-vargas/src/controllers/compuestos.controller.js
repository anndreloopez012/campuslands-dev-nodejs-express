import { compuestos } from '../services/index.js';
import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaCompuesto } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listar = catchAsync((req, res) => enviarListado(res, compuestos.listar(req.query)));

export const obtener = catchAsync((req, res) => enviar(res, compuestos.obtener(validarId(req.params.id))));

export const crear = catchAsync((req, res) => {
  const creado = compuestos.crear(validarCuerpo(req.body, esquemaCompuesto));
  res.set('Location', `${req.baseUrl}/${creado.id}`);
  enviar(res, creado, 201);
});

export const eliminar = catchAsync((req, res) => enviar(res, compuestos.eliminar(validarId(req.params.id))));
