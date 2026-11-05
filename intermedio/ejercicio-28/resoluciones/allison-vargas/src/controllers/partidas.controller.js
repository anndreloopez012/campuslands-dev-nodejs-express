import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaEliminacion, esquemaPartida, esquemaUnirse } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearPartidasController(partidas) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, partidas.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, partidas.obtener(validarId(req.params.id)))),
    crear: catchAsync((req, res) => {
      const creada = partidas.crear(validarCuerpo(req.body, esquemaPartida));
      res.set('Location', `${req.baseUrl}/${creada.id}`);
      enviar(res, creada, 201);
    }),
    unir: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, partidas.unir(id, validarCuerpo(req.body, esquemaUnirse)), 201);
    }),
    retirar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, partidas.retirar(id, validarId(req.params.jugadorId)));
    }),
    iniciar: catchAsync((req, res) => enviar(res, partidas.iniciar(validarId(req.params.id)))),
    eliminar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, partidas.eliminar(id, validarCuerpo(req.body, esquemaEliminacion)));
    }),
    resultados: catchAsync((req, res) => enviar(res, partidas.resultados(validarId(req.params.id)))),
  };
}
