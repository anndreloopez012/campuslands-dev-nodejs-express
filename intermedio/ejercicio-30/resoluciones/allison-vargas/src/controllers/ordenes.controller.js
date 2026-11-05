import { validarCuerpo } from '../validators/esquema.js';
import { validarId } from '../validators/id.validator.js';
import {
  esquemaAsignar,
  esquemaEstado,
  esquemaHoras,
  esquemaItem,
  esquemaOrden,
} from '../validators/schemas.js';
import { enviar, enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearOrdenesController(ordenes) {
  return {
    listar: catchAsync((req, res) => enviarListado(res, ordenes.listar(req.query, req.usuario))),
    obtener: catchAsync((req, res) => enviar(res, ordenes.obtener(validarId(req.params.id), req.usuario))),
    crear: catchAsync((req, res) => {
      const creada = ordenes.crear(validarCuerpo(req.body, esquemaOrden), req.usuario);
      res.set('Location', `${req.baseUrl}/${creada.id}`);
      enviar(res, creada, 201);
    }),
    asignar: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, ordenes.asignar(id, validarCuerpo(req.body, esquemaAsignar), req.usuario));
    }),
    cambiarEstado: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, ordenes.cambiarEstado(id, validarCuerpo(req.body, esquemaEstado), req.usuario));
    }),
    agregarItem: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, ordenes.agregarItem(id, validarCuerpo(req.body, esquemaItem), req.usuario), 201);
    }),
    quitarItem: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, ordenes.quitarItem(id, validarId(req.params.repuestoId), req.usuario));
    }),
    registrarHoras: catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, ordenes.registrarHoras(id, validarCuerpo(req.body, esquemaHoras), req.usuario));
    }),
    factura: catchAsync((req, res) => enviar(res, ordenes.factura(validarId(req.params.id)))),
    mecanicos: catchAsync((req, res) => enviar(res, ordenes.cargaMecanicos())),
  };
}
