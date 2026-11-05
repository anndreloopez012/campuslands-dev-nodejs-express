import express, { Router } from 'express';
import { proximas } from '../jobs/cron.js';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  exigirCuerpo, leerEntero, leerId, leerOpcion, rechazarSobrantes, terminar,
} from '../validators/comunes.js';

const json = [exigirTipo('application/json'), express.json({ limit: '2kb' })];
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });

function leerCuerpoEntero(cuerpo, campo, opciones) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, [campo], errores);
  const valor = leerEntero(cuerpo, campo, errores, opciones);
  return terminar(errores, valor);
}

const leerNombreJob = (texto) => (/^[a-z-]{3,40}$/.test(texto) ? texto : terminar([{ campo: 'nombre', mensaje: 'nombre de job invalido' }]));

export function crearJobsRouter({ planificador, reloj }) {
  const router = Router();

  router.route('/jobs').get((req, res) => ok(res, planificador.listar())).all(metodoNoPermitido(['GET']));
  router.route('/jobs/:nombre').get((req, res) => ok(res, planificador.obtener(leerNombreJob(req.params.nombre)))).all(metodoNoPermitido(['GET']));
  router.route('/jobs/:nombre/historial')
    .get((req, res) => ok(res, planificador.historial(leerNombreJob(req.params.nombre))))
    .all(metodoNoPermitido(['GET']));
  router.route('/jobs/:nombre/ejecucion')
    .post(catchAsync(async (req, res) => ok(res, await planificador.ejecutarAhora(leerNombreJob(req.params.nombre)))))
    .all(metodoNoPermitido(['POST']));
  router.route('/jobs/:nombre/pausa')
    .post((req, res) => ok(res, planificador.pausar(leerNombreJob(req.params.nombre))))
    .all(metodoNoPermitido(['POST']));
  router.route('/jobs/:nombre/reanudacion')
    .post((req, res) => ok(res, planificador.reanudar(leerNombreJob(req.params.nombre))))
    .all(metodoNoPermitido(['POST']));

  router.route('/cron/proximas')
    .get((req, res) => {
      const errores = [];
      rechazarSobrantes(req.query, ['expresion', 'cantidad', 'desde'], errores);
      const { expresion } = req.query;
      if (typeof expresion !== 'string' || expresion.length > 100) errores.push({ campo: 'expresion', mensaje: 'es obligatoria (maximo 100 caracteres)' });
      let cantidad = 5;
      if (req.query.cantidad !== undefined) {
        cantidad = /^\d{1,2}$/.test(req.query.cantidad) ? Number(req.query.cantidad) : 0;
        if (cantidad < 1 || cantidad > 20) errores.push({ campo: 'cantidad', mensaje: 'debe estar entre 1 y 20' });
      }
      let desde = reloj();
      if (req.query.desde !== undefined) {
        desde = new Date(req.query.desde);
        if (Number.isNaN(desde.getTime())) errores.push({ campo: 'desde', mensaje: 'debe ser una fecha ISO' });
      }
      terminar(errores);
      ok(res, { expresion, desde: desde.toISOString(), proximas: proximas(expresion, desde, cantidad) });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearTallerRouter({ taller }) {
  const router = Router();

  router.route('/maquinas').get((req, res) => ok(res, taller.maquinas())).all(metodoNoPermitido(['GET']));
  router.route('/maquinas/:id/uso')
    .post(...json, (req, res) => ok(res, taller.registrarUso(leerId(req.params.id), leerCuerpoEntero(req.body, 'horas', { min: 1, max: 24 }))))
    .all(metodoNoPermitido(['POST']));
  router.route('/maquinas/:id/mantenimiento')
    .post((req, res) => ok(res, taller.mantener(leerId(req.params.id))))
    .all(metodoNoPermitido(['POST']));
  router.route('/soldadores').get((req, res) => ok(res, taller.soldadores())).all(metodoNoPermitido(['GET']));
  router.route('/consumibles').get((req, res) => ok(res, taller.consumibles())).all(metodoNoPermitido(['GET']));
  router.route('/consumibles/:id/consumo')
    .post(...json, (req, res) => ok(res, taller.consumir(leerId(req.params.id), leerCuerpoEntero(req.body, 'cantidad', { min: 1, max: 1000 }))))
    .all(metodoNoPermitido(['POST']));
  router.route('/alertas')
    .get((req, res) => {
      const errores = [];
      const estado = leerOpcion(req.query, 'estado', ['abierta', 'resuelta'], errores, { requerido: false });
      terminar(errores);
      ok(res, taller.alertas(estado));
    })
    .all(metodoNoPermitido(['GET']));
  router.route('/alertas/:id/resolucion')
    .post((req, res) => ok(res, taller.resolverAlerta(leerId(req.params.id))))
    .all(metodoNoPermitido(['POST']));
  router.route('/ordenes-compra').get((req, res) => ok(res, taller.ordenes())).all(metodoNoPermitido(['GET']));

  return router;
}
