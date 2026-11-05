import { validarId } from '../validators/id.validator.js';
import { validarPartida } from '../validators/partida.validator.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearPartidasController(partidas) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, partidas.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, partidas.obtener(validarId(req.params.id)))),
    registrar: catchAsync(async (req, res) => {
      const registrada = await partidas.registrar(validarPartida(req.body));
      res.set('Location', `${req.baseUrl}/${registrada.id}`);
      enviar(res, registrada, 201);
    }),
  };
}
