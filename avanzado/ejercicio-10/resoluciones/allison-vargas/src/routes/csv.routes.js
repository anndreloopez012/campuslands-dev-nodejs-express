import { Router } from 'express';
import express from 'express';
import { LIMITES } from '../constants/csv.js';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerCharset } from '../domain/texto.js';
import { crear } from '../errores/index.js';
import { leerOpcionesDeLectura } from '../validators/partido.js';

export const cuerpoCsv = [
  exigirTipo('text/csv'),
  express.raw({ type: 'text/csv', limit: LIMITES.bytes }),
  (req, res, next) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return next(crear('CSV_VACIO'));
    req.charset = leerCharset(req.headers['content-type']);
    return next();
  },
];

export function crearCsvRouter({ importador }) {
  const router = Router();

  router.route('/analizar')
    .post(...cuerpoCsv, (req, res) => {
      const opciones = leerOpcionesDeLectura(req.query, { importar: false });
      res.status(200).json({ ok: true, data: importador.analizar(req.body, { charset: req.charset, ...opciones }) });
    })
    .all(metodoNoPermitido(['POST']));

  return router;
}
