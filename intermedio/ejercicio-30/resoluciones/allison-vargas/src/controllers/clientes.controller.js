import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaCliente } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearClientesController(clientes) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, clientes.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, clientes.obtener(validarId(req.params.id)))),
    crear: catchAsync((req, res) => {
      const creado = clientes.crear(validarCuerpo(req.body, esquemaCliente));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      enviar(res, creado, 201);
    }),
    actualizar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, clientes.actualizar(id, validarCuerpo(req.body, esquemaCliente, { parcial: true })));
    }),
  };
}
