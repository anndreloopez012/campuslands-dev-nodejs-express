import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaInscripcion } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearTorneosController(torneos) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, torneos.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, torneos.obtener(validarId(req.params.id)))),
    listarInscripciones: catchAsync((req, res) =>
      enviar(res, torneos.listarInscripciones(validarId(req.params.id)))),
    inscribir: catchAsync((req, res) => {
      const torneoId = validarId(req.params.id);
      const creada = torneos.inscribir(torneoId, validarCuerpo(req.body, esquemaInscripcion));
      res.set('Location', `${req.baseUrl}/${torneoId}/inscripciones`);
      enviar(res, creada, 201);
    }),
    retirar: catchAsync((req, res) => {
      const torneoId = validarId(req.params.id);
      enviar(res, torneos.retirar(torneoId, validarId(req.params.equipoId)));
    }),
  };
}
