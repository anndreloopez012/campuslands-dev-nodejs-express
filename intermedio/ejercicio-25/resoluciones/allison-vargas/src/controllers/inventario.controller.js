import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaItem } from '../validators/schemas.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearInventarioController(inventario) {
  return {
    listar: catchAsync((req, res) => enviar(res, inventario.listar(validarId(req.params.id)))),

    agregar: catchAsync((req, res) => {
      const personajeId = validarId(req.params.id);
      const creado = inventario.agregar(personajeId, validarCuerpo(req.body, esquemaItem));
      res.set('Location', `${req.baseUrl}/${personajeId}/inventario/${creado.id}`);
      enviar(res, creado, 201);
    }),

    quitar: catchAsync((req, res) => {
      const personajeId = validarId(req.params.id);
      enviar(res, inventario.quitar(personajeId, validarId(req.params.itemId)));
    }),
  };
}
