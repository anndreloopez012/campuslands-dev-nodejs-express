import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import {
  consultaTrabajos,
  validarFallo,
  validarResultado,
  validarToken,
  validarTrabajoNuevo,
} from '../validators/trabajo.js';

export function crearTrabajosRouter({ trabajos, permitirSimulaciones }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = trabajos.listar(consultaTrabajos(req.query));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const { trabajo, duplicado } = trabajos.encolar(validarTrabajoNuevo(req.body, { permitirSimulaciones }));
      if (duplicado) return res.status(200).json({ ok: true, data: trabajo, duplicado: true });
      res.set('Location', `${req.baseUrl}/${trabajo.id}`);
      return res.status(201).json({ ok: true, data: trabajo, duplicado: false });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: trabajos.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  const accion = (nombre, validar, ejecutar) => {
    router.route(`/:id/${nombre}`)
      .post(exigirJson, catchAsync((req, res) => {
        const id = leerId(req.params.id);
        res.status(200).json({ ok: true, data: ejecutar(id, validar(req.body)) });
      }))
      .all(metodoNoPermitido(['POST']));
  };

  accion('completar', validarResultado, (id, datos) => trabajos.completar(id, datos));
  accion('fallar', validarFallo, (id, datos) => trabajos.fallar(id, datos));
  accion('extender', (cuerpo) => validarToken(cuerpo), (id, datos) => trabajos.extender(id, datos));

  for (const nombre of ['cancelar', 'reencolar']) {
    router.route(`/:id/${nombre}`)
      .post(catchAsync((req, res) => {
        res.status(200).json({ ok: true, data: trabajos[nombre](leerId(req.params.id)) });
      }))
      .all(metodoNoPermitido(['POST']));
  }

  return router;
}
