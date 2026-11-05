import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId, leerOpcion, terminar } from '../validators/comunes.js';
import { validarConfigReceptor, validarSuscripcion } from '../validators/webhooks.js';

const json = [exigirTipo('application/json'), express.json({ limit: '8kb' })];
const ESTADOS = ['pendiente', 'entregada', 'fallida', 'descartada'];
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });

const leerPrefijo = (prefijo) => (texto) => {
  if (new RegExp(`^${prefijo}_[0-9a-f]{16}$`).test(texto)) return texto;
  return terminar([{ campo: 'id', mensaje: `debe ser un id ${prefijo}_...` }]);
};
const idSuscripcion = leerPrefijo('sus');
const idEntrega = leerPrefijo('ent');

export function crearProyectosRouter({ proyectos }) {
  const router = Router();
  router.route('/')
    .get((req, res) => ok(res, proyectos.listar()))
    .post(...json, (req, res) => ok(res, proyectos.crear(req.body), 201))
    .all(metodoNoPermitido(['GET', 'POST']));
  router.route('/:id')
    .get((req, res) => ok(res, proyectos.obtener(leerId(req.params.id))))
    .all(metodoNoPermitido(['GET']));
  router.route('/:id/planos')
    .post(...json, (req, res) => ok(res, proyectos.publicarPlano(leerId(req.params.id), req.body), 201))
    .all(metodoNoPermitido(['POST']));
  router.route('/:id/aprobacion')
    .post((req, res) => ok(res, proyectos.aprobar(leerId(req.params.id))))
    .all(metodoNoPermitido(['POST']));
  return router;
}

export function crearWebhooksRouter({ despachador, permitirLocal }) {
  const router = Router();

  router.route('/suscripciones')
    .get((req, res) => ok(res, despachador.listar()))
    .post(...json, (req, res) => ok(res, despachador.suscribir(validarSuscripcion(req.body, { permitirLocal })), 201))
    .all(metodoNoPermitido(['GET', 'POST']));
  router.route('/suscripciones/:id')
    .get((req, res) => ok(res, despachador.obtener(idSuscripcion(req.params.id))))
    .delete((req, res) => {
      despachador.eliminar(idSuscripcion(req.params.id));
      res.status(204).end();
    })
    .all(metodoNoPermitido(['GET', 'DELETE']));
  router.route('/suscripciones/:id/rotacion')
    .post((req, res) => ok(res, despachador.rotarSecreto(idSuscripcion(req.params.id))))
    .all(metodoNoPermitido(['POST']));
  router.route('/suscripciones/:id/reactivacion')
    .post((req, res) => ok(res, despachador.reactivar(idSuscripcion(req.params.id))))
    .all(metodoNoPermitido(['POST']));
  router.route('/suscripciones/:id/prueba')
    .post((req, res) => ok(res, despachador.probar(idSuscripcion(req.params.id)), 202))
    .all(metodoNoPermitido(['POST']));

  router.route('/eventos')
    .get((req, res) => ok(res, despachador.eventos()))
    .all(metodoNoPermitido(['GET']));
  router.route('/entregas')
    .get((req, res) => {
      const errores = [];
      const estado = leerOpcion(req.query, 'estado', ESTADOS, errores, { requerido: false });
      terminar(errores);
      ok(res, despachador.entregas({ estado }));
    })
    .all(metodoNoPermitido(['GET']));
  router.route('/entregas/:id')
    .get((req, res) => ok(res, despachador.entrega(idEntrega(req.params.id))))
    .all(metodoNoPermitido(['GET']));
  router.route('/entregas/:id/reintento')
    .post((req, res) => ok(res, despachador.reintentar(idEntrega(req.params.id)), 202))
    .all(metodoNoPermitido(['POST']));

  return router;
}

export function crearReceptorRouter({ receptor }) {
  const router = Router();
  router.route('/')
    // el body se lee CRUDO: la firma se calcula sobre los bytes exactos, no sobre un JSON re-serializado
    .post(express.raw({ type: 'application/json', limit: '64kb' }), (req, res) => {
      const cuerpoCrudo = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
      const { status, cuerpo } = receptor.recibir({ cuerpoCrudo, cabeceras: req.headers });
      res.status(status).json(cuerpo ?? { ok: status < 300 });
    })
    .all(metodoNoPermitido(['POST']));
  router.route('/configuracion')
    .put(...json, (req, res) => ok(res, receptor.configurar(validarConfigReceptor(req.body))))
    .all(metodoNoPermitido(['PUT']));
  router.route('/recibidos')
    .get((req, res) => ok(res, { recibidos: receptor.recibidos(), rechazos: receptor.rechazos() }))
    .all(metodoNoPermitido(['GET']));
  return router;
}
