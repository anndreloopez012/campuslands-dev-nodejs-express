import { createHash } from 'node:crypto';
import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { CATEGORIAS } from '../services/quimica.service.js';
import { paginaDocs } from '../docs/pagina.js';
import {
  leerId, leerOpcion, rechazarSobrantes, terminar,
} from '../validators/comunes.js';

const json = [exigirTipo('application/json'), express.json({ limit: '4kb' })];

// todas las rutas viven en un solo router: asi las pruebas pueden recorrerlo y compararlo con la spec
export function crearRouterQuimica({ quimica, especificacion }) {
  const router = Router();
  const textoSpec = JSON.stringify(especificacion);
  const etag = `"${createHash('sha1').update(textoSpec).digest('hex').slice(0, 16)}"`;

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'documentacion OpenAPI manual' });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/openapi.json')
    .get((req, res) => {
      res.set({ ETag: etag, 'Cache-Control': 'public, max-age=300' });
      if (req.get('if-none-match') === etag) return res.status(304).end();
      return res.type('application/json').status(200).send(textoSpec);
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/docs')
    .get((req, res) => {
      res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'").type('html').status(200).send(paginaDocs(especificacion));
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/elementos')
    .get((req, res) => res.status(200).json({ ok: true, data: quimica.elementos() }))
    .all(metodoNoPermitido(['GET']));

  router.route('/elementos/:simbolo')
    .get((req, res) => {
      const { simbolo } = req.params;
      if (!/^[A-Z][a-z]?$/.test(simbolo)) terminar([{ campo: 'simbolo', mensaje: 'una mayuscula y opcionalmente una minuscula' }]);
      res.status(200).json({ ok: true, data: quimica.elemento(simbolo) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/formulas/analisis')
    .post(...json, (req, res) => res.status(200).json({ ok: true, data: quimica.analizar(req.body) }))
    .all(metodoNoPermitido(['POST']));

  router.route('/formulas/conversion')
    .post(...json, (req, res) => res.status(200).json({ ok: true, data: quimica.convertir(req.body) }))
    .all(metodoNoPermitido(['POST']));

  router.route('/compuestos')
    .get((req, res) => {
      const errores = [];
      rechazarSobrantes(req.query, ['categoria', 'q'], errores);
      const categoria = leerOpcion(req.query, 'categoria', CATEGORIAS, errores, { requerido: false });
      const { q } = req.query;
      if (q !== undefined && (typeof q !== 'string' || q.length < 1 || q.length > 40)) errores.push({ campo: 'q', mensaje: 'debe tener de 1 a 40 caracteres' });
      terminar(errores);
      res.status(200).json({ ok: true, data: quimica.listar({ categoria, q }) });
    })
    .post(...json, (req, res) => {
      const compuesto = quimica.crear(req.body);
      res.set('Location', `${req.baseUrl}/compuestos/${compuesto.id}`).status(201).json({ ok: true, data: compuesto });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/compuestos/:id')
    .get((req, res) => res.status(200).json({ ok: true, data: quimica.obtener(leerId(req.params.id)) }))
    .delete((req, res) => {
      quimica.eliminar(leerId(req.params.id));
      res.status(204).end();
    })
    .all(metodoNoPermitido(['GET', 'DELETE']));

  return router;
}
