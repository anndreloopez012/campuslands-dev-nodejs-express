import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaPersonaje, esquemaRenombrar } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearPersonajesController(personajes) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, personajes.listar(req.query))),

    ranking: catchAsync((req, res) => enviarListado(res, personajes.ranking(req.query))),

    obtener: catchAsync((req, res) => enviar(res, personajes.obtener(validarId(req.params.id)))),

    crear: catchAsync((req, res) => {
      const creado = personajes.crear(validarCuerpo(req.body, esquemaPersonaje));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      enviar(res, creado, 201);
    }),

    renombrar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, personajes.renombrar(id, validarCuerpo(req.body, esquemaRenombrar)));
    }),

    eliminar: catchAsync((req, res) => enviar(res, personajes.eliminar(validarId(req.params.id)))),
  };
}
