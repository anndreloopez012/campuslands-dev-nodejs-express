import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { consultaFichajes } from '../validators/consultas.js';
import { leerClaveDeIdempotencia, validarFichaje, validarIntercambio } from '../validators/fichaje.js';

function respuestaDeEscritura(req, res, { respuesta, repetida }) {
  if (repetida) {
    res.set('Idempotent-Replay', 'true');
    return res.status(200).json({ ok: true, data: respuesta, repetida: true });
  }
  res.set('Location', `${req.baseUrl.replace(/\/intercambios$/, '/fichajes')}/${respuesta.id}`);
  return res.status(201).json({ ok: true, data: respuesta, repetida: false });
}

export function crearFichajesRouter({ fichajes, permitirFallos }) {
  const router = Router();
  const opciones = { permitirFallos };

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = fichajes.listar(consultaFichajes(req.query));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync(async (req, res) => {
      const clave = leerClaveDeIdempotencia(req.get('Idempotency-Key'));
      const cuerpo = validarFichaje(req.body, opciones);
      respuestaDeEscritura(req, res, await fichajes.fichar(cuerpo, clave));
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/simulacion')
    .post(exigirJson, catchAsync(async (req, res) => {
      res.status(200).json({ ok: true, data: await fichajes.simularFichaje(validarFichaje(req.body, opciones)) });
    }))
    .all(metodoNoPermitido(['POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: fichajes.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearIntercambiosRouter({ fichajes, permitirFallos }) {
  const router = Router();
  const opciones = { permitirFallos };

  router.route('/')
    .post(exigirJson, catchAsync(async (req, res) => {
      const clave = leerClaveDeIdempotencia(req.get('Idempotency-Key'));
      const cuerpo = validarIntercambio(req.body, opciones);
      respuestaDeEscritura(req, res, await fichajes.intercambiar(cuerpo, clave));
    }))
    .all(metodoNoPermitido(['POST']));

  router.route('/simulacion')
    .post(exigirJson, catchAsync(async (req, res) => {
      res.status(200).json({ ok: true, data: await fichajes.simularIntercambio(validarIntercambio(req.body, opciones)) });
    }))
    .all(metodoNoPermitido(['POST']));

  return router;
}
