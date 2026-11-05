import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerConsultaLogs, validarNivel } from '../validators/mision.js';

export function crearObservabilidadRouter({ logger, memoria, reloj, inicio }) {
  const router = Router();

  router.route('/health')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        estado: 'arriba',
        tiempoActivoS: Math.round((reloj().getTime() - inicio.getTime()) / 1000),
        nivelLog: logger.nivel,
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/logs')
    .get((req, res) => {
      const filtros = leerConsultaLogs(req.query);
      const { total, data } = memoria.consultar(filtros);
      res.set('Cache-Control', 'no-store').status(200).json({
        ok: true, total, data, estadisticas: memoria.estadisticas(),
      });
    })
    .delete((req, res) => {
      const borradas = memoria.limpiar();
      req.log.warn('logs.limpiados', { borradas });
      res.status(200).json({ ok: true, borradas });
    })
    .all(metodoNoPermitido(['GET', 'DELETE']));

  router.route('/logs/nivel')
    .get((req, res) => {
      res.status(200).json({ ok: true, nivel: logger.nivel });
    })
    .put(exigirTipo('application/json'), express.json({ limit: '1kb' }), (req, res) => {
      const { nivel } = validarNivel(req.body);
      const anterior = logger.cambiarNivel(nivel);
      req.log.warn('logs.nivel_cambiado', { anterior, nuevo: nivel });
      res.status(200).json({ ok: true, anterior, nivel });
    })
    .all(metodoNoPermitido(['GET', 'PUT']));

  return router;
}
