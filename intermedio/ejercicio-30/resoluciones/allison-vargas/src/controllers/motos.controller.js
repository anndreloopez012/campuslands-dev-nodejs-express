import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaMoto, esquemaMotoEdicion } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearMotosController(motos) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, motos.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, motos.obtener(validarId(req.params.id)))),
    crear: catchAsync((req, res) => {
      const creada = motos.crear(validarCuerpo(req.body, esquemaMoto));
      res.set('Location', `${req.baseUrl}/${creada.id}`);
      enviar(res, creada, 201);
    }),
    actualizar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, motos.actualizar(id, validarCuerpo(req.body, esquemaMotoEdicion, { parcial: true })));
    }),
  };
}
