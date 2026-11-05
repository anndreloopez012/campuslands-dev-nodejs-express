import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaReabastecer, esquemaRepuesto, esquemaRepuestoEdicion } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearRepuestosController(repuestos) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, repuestos.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, repuestos.obtener(validarId(req.params.id)))),
    crear: catchAsync((req, res) => {
      const creado = repuestos.crear(validarCuerpo(req.body, esquemaRepuesto));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      enviar(res, creado, 201);
    }),
    actualizar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, repuestos.actualizar(id, validarCuerpo(req.body, esquemaRepuestoEdicion, { parcial: true })));
    }),
    reabastecer: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, repuestos.reabastecer(id, validarCuerpo(req.body, esquemaReabastecer).cantidad));
    }),
  };
}
