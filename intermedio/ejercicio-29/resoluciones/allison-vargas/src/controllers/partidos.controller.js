import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaPartido } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearPartidosController(partidos) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, partidos.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, partidos.obtener(validarId(req.params.id)))),
    registrar: catchAsync((req, res) => {
      const creado = partidos.registrar(validarCuerpo(req.body, esquemaPartido));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      enviar(res, creado, 201);
    }),
  };
}
