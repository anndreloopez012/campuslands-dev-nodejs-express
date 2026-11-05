import { validarCuerpo } from '../validators/esquema.js';
import { esquemaLogin } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearAuthController(auth) {
  return {
    login: catchAsync((req, res) => enviar(res, auth.login(validarCuerpo(req.body, esquemaLogin)))),
    yo: (req, res) => enviar(res, req.usuario),
  };
}
