import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaJugador } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearJugadoresController(jugadores) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, jugadores.listar(req.query))),
    ranking: catchAsync((req, res) => enviarListado(res, jugadores.ranking(req.query))),
    obtener: catchAsync((req, res) => enviar(res, jugadores.obtener(validarId(req.params.id)))),
    crear: catchAsync((req, res) => {
      const creado = jugadores.crear(validarCuerpo(req.body, esquemaJugador));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      enviar(res, creado, 201);
    }),
  };
}
