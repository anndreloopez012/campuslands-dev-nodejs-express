import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { consultaClaves, validarAvance, validarClave } from '../validators/auto.js';

export function crearCacheRouter({ admin }) {
  const router = Router();

  router.route('/estadisticas')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: admin.estadisticas() });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/claves')
    .get((req, res) => {
      const data = admin.claves(consultaClaves(req.query));
      res.status(200).json({ ok: true, data, total: data.length });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/claves/:clave')
    .delete(catchAsync((req, res) => {
      admin.borrarClave(validarClave(req.params.clave));
      res.status(204).end();
    }))
    .all(metodoNoPermitido(['DELETE']));

  router.route('/etiquetas/:etiqueta')
    .delete((req, res) => {
      const invalidadas = admin.invalidarEtiqueta(validarClave(req.params.etiqueta, 'etiqueta'));
      res.status(200).json({ ok: true, data: { invalidadas } });
    })
    .all(metodoNoPermitido(['DELETE']));

  router.route('/purgar')
    .post((req, res) => {
      res.status(200).json({ ok: true, data: { purgadas: admin.purgar() } });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/')
    .delete((req, res) => {
      res.status(200).json({ ok: true, data: { eliminadas: admin.vaciar() } });
    })
    .all(metodoNoPermitido(['DELETE']));

  return router;
}

export function crearRelojRouter({ sistema }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: sistema.reloj() });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/avanzar')
    .post(exigirJson, (req, res) => {
      res.status(200).json({ ok: true, data: sistema.avanzarReloj(validarAvance(req.body).ms) });
    })
    .all(metodoNoPermitido(['POST']));

  return router;
}
