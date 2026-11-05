import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearTablaController(tabla) {
  return {
    obtener: catchAsync((req, res) => enviar(res, tabla.obtener(req.query))),
  };
}
