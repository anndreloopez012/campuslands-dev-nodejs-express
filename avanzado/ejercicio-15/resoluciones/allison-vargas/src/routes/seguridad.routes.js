import express, { Router } from 'express';
import { crear } from '../errores/index.js';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { analizarCabeceras } from '../seguridad/analizador.js';
import { sinCache } from '../seguridad/cabeceras.js';
import { validarAnalisis } from '../validators/entradas.js';

const TIPOS_REPORTE = ['application/csp-report', 'application/reports+json', 'application/json'];

const exigirTipoReporte = (req, res, next) => {
  const tipo = (req.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (TIPOS_REPORTE.includes(tipo)) return next();
  return next(crear('FORMATO_NO_SOPORTADO', { esperado: TIPOS_REPORTE.join(' o ') }));
};

export function crearSeguridadRouter({ puestos }) {
  const router = Router();
  router.use(sinCache);

  router.route('/csp-reportes')
    .post(exigirTipoReporte, express.json({ limit: '10kb', type: TIPOS_REPORTE }), (req, res) => {
      puestos.registrarReportesCsp(req.body, req.get('user-agent') ?? null);
      res.status(204).end();
    })
    .get((req, res) => {
      res.status(200).json({ ok: true, data: puestos.reportesCsp() });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/seguridad/autoevaluacion')
    .get((req, res) => {
      // se evaluan las cabeceras que ya puso el middleware global en esta misma respuesta
      const informe = analizarCabeceras(res.getHeaders(), { esHttps: req.secure });
      res.status(200).json({ ok: true, data: { ...informe, https: req.secure } });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/seguridad/analizar')
    .post(exigirTipo('application/json'), express.json({ limit: '20kb' }), (req, res) => {
      const { cabeceras, https } = validarAnalisis(req.body);
      res.status(200).json({ ok: true, data: analizarCabeceras(cabeceras, { esHttps: https }) });
    })
    .all(metodoNoPermitido(['POST']));

  return router;
}
