import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import { esquemaEquipo, esquemaEquipoCambios } from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearEquiposController(equipos) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, equipos.listar(req.query))),
    obtener: catchAsync((req, res) => enviar(res, equipos.obtener(validarId(req.params.id)))),
    crear: catchAsync((req, res) => {
      const creado = equipos.crear(validarCuerpo(req.body, esquemaEquipo));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      enviar(res, creado, 201);
    }),
    actualizar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, equipos.actualizar(id, validarCuerpo(req.body, esquemaEquipoCambios, { parcial: true })));
    }),
    eliminar: catchAsync((req, res) => enviar(res, equipos.eliminar(validarId(req.params.id)))),
  };
}
