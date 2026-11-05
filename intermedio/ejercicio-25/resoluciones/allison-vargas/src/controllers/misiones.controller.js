import { validarId } from '../validators/id.validator.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearMisionesController(misiones) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, misiones.listar(req.query))),

    obtener: catchAsync((req, res) => enviar(res, misiones.obtener(validarId(req.params.id)))),

    completar: catchAsync((req, res) => {
      const personajeId = validarId(req.params.id);
      enviar(res, misiones.completar(personajeId, validarId(req.params.misionId)));
    }),
  };
}
