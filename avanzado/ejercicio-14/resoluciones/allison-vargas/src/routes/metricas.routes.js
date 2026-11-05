import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { TIPO_PROMETHEUS } from '../metricas/formato.js';

export function crearMetricasRouter({ metricas }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      res.set({ 'Content-Type': TIPO_PROMETHEUS, 'Cache-Control': 'no-store' }).status(200).send(metricas.texto());
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/json')
    .get((req, res) => {
      res.set('Cache-Control', 'no-store').status(200).json({ ok: true, data: metricas.json() });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/resumen')
    .get((req, res) => {
      res.set('Cache-Control', 'no-store').status(200).json({ ok: true, data: metricas.resumen() });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
