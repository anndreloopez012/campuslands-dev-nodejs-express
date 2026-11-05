import express, { Router } from 'express';
import { LIMITES, TIPOS_ACEPTADOS, FORMATOS_RECHAZOS } from '../constants/musica.js';
import { crear } from '../errores/index.js';
import { escribirCsv } from '../domain/csv.js';
import { exigirTipos } from '../middlewares/exigirTipos.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { catchAsync } from '../utils/catchAsync.js';
import { leerId } from '../validators/comunes.js';
import {
  leerExportacionRechazos, leerListadoImportaciones, leerOpcionesImportacion, leerPagina,
} from '../validators/cancion.js';

function entradasDeJson(cuerpo) {
  const errores = [];
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    errores.push({ campo: 'cuerpo', mensaje: 'debe ser un objeto con la propiedad canciones' });
  } else if (!Array.isArray(cuerpo.canciones)) {
    errores.push({ campo: 'canciones', mensaje: 'debe ser una lista' });
  }
  if (errores.length) throw crear('VALIDACION', {}, { detalles: errores });
  return cuerpo.canciones.map((dato, indice) => ({ fila: indice + 1, dato }));
}

function entradasDeNdjson(buffer) {
  let texto;
  try {
    texto = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch (error) {
    throw crear('CODIFICACION_INVALIDA', {}, { causa: error });
  }
  const entradas = [];
  texto.split('\n').forEach((linea, indice) => {
    const limpia = linea.endsWith('\r') ? linea.slice(0, -1) : linea;
    if (limpia.trim() === '') return;
    try {
      entradas.push({ fila: indice + 1, dato: JSON.parse(limpia) });
    } catch {
      entradas.push({ fila: indice + 1, errorDeLectura: 'la linea no es un JSON valido', textoCrudo: limpia.slice(0, 200) });
    }
  });
  return entradas;
}

const leerCuerpo = [
  exigirTipos(TIPOS_ACEPTADOS),
  express.json({ limit: LIMITES.bytes }),
  express.raw({ type: 'application/x-ndjson', limit: LIMITES.bytes }),
];

export function crearImportacionesRouter({ importaciones }) {
  const router = Router();

  router.route('/')
    .post(...leerCuerpo, catchAsync(async (req, res) => {
      const { opciones, esperar, clave } = leerOpcionesImportacion(req.query, req.headers);
      const esNdjson = Buffer.isBuffer(req.body);
      const entradas = esNdjson ? entradasDeNdjson(req.body) : entradasDeJson(req.body);
      if (entradas.length === 0) throw crear('IMPORTACION_VACIA');
      if (entradas.length > LIMITES.filas) throw crear('IMPORTACION_DEMASIADO_GRANDE', { maximo: LIMITES.filas });

      const creada = importaciones.crear({
        entradas, formato: esNdjson ? 'ndjson' : 'json', opciones, clave,
      });
      const id = creada.importacion.id;
      res.set('Location', `${req.baseUrl}/${id}`);
      if (creada.repetida) {
        res.set('Idempotent-Replayed', 'true');
        return res.status(200).json({ ok: true, repetida: true, data: importaciones.obtener(id) });
      }
      if (!esperar) return res.status(202).json({ ok: true, data: creada.importacion });
      const final = await importaciones.esperar(id);
      return res.status(final.dryRun ? 200 : 201).json({ ok: true, data: final });
    }))
    .get((req, res) => {
      const { pagina, limite, estado } = leerListadoImportaciones(req.query, importaciones.estados);
      const { data, paginacion } = importaciones.listar({ pagina, limite, estado });
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: importaciones.obtener(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/cancelar')
    .post((req, res) => {
      const data = importaciones.cancelar(leerId(req.params.id));
      res.status(data.estado === 'procesando' ? 202 : 200).json({ ok: true, data });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/revertir')
    .post((req, res) => {
      res.status(200).json({ ok: true, data: importaciones.revertir(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/rechazos')
    .get((req, res) => {
      const id = leerId(req.params.id);
      const { data, paginacion } = importaciones.rechazos(id, leerPagina(req.query));
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/rechazos/exportar')
    .get((req, res) => {
      const { formato } = leerExportacionRechazos(req.query);
      const rechazos = importaciones.todosLosRechazos(leerId(req.params.id));
      res.status(200).set({
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `attachment; filename="rechazos.${formato}"`,
      });
      if (formato === FORMATOS_RECHAZOS[0]) {
        res.type('application/x-ndjson; charset=utf-8').send(rechazos.map((r) => `${JSON.stringify(r)}\n`).join(''));
        return;
      }
      const filas = rechazos.map((r) => ({
        fila: r.fila,
        isrc: r.datos?.isrc ?? '',
        titulo: r.datos?.titulo ?? '',
        artista: r.datos?.artista ?? '',
        motivo: r.errores.map((e) => `${e.campo}: ${e.mensaje}`).join('; '),
      }));
      res.type('text/csv; charset=utf-8').send(escribirCsv(['fila', 'isrc', 'titulo', 'artista', 'motivo'], filas));
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
