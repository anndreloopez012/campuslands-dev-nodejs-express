import express, { Router } from 'express';
import { crear } from '../errores/index.js';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { etiquetaDe } from '../services/escenas.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { leerId } from '../validators/comunes.js';
import { validarRender } from '../validators/render.js';

const json = [exigirTipo('application/json'), express.json({ limit: '32kb' })];

const identificarCliente = (req, res, next) => {
  const cliente = req.get('x-cliente-id');
  if (!/^[a-z0-9-]{3,40}$/.test(cliente ?? '')) return next(crear('CLIENTE_REQUERIDO'));
  req.cliente = cliente;
  return next();
};

export function crearEscenasRouter({ escenas }) {
  const router = Router();

  router.route('/')
    .get((req, res) => res.status(200).json({ ok: true, data: escenas.listar() }))
    .post(...json, (req, res) => {
      const nueva = escenas.crear(req.body);
      res.set({ Location: `${req.baseUrl}/${nueva.id}`, ETag: etiquetaDe(nueva) }).status(201).json({ ok: true, data: nueva });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get((req, res) => {
      const escena = escenas.obtener(leerId(req.params.id));
      res.set('ETag', etiquetaDe(escena)).status(200).json({ ok: true, data: escena });
    })
    .put(...json, (req, res) => {
      const escena = escenas.reemplazar(leerId(req.params.id), req.body, req.get('if-match'));
      res.set('ETag', etiquetaDe(escena)).status(200).json({ ok: true, data: escena });
    })
    .all(metodoNoPermitido(['GET', 'PUT']));

  router.route('/:id/vista-previa')
    .get(catchAsync(async (req, res) => {
      res.status(200).json({ ok: true, data: await escenas.vistaPrevia(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearRendersRouter({ escenas, granja }) {
  const router = Router();

  router.route('/')
    .post(...json, identificarCliente, (req, res) => {
      const datos = validarRender(req.body);
      const escena = escenas.obtener(datos.escenaId);
      // se guarda la version de la escena: el render no cambia si alguien la edita despues
      const trabajo = granja.encolar(req.cliente, { ...datos, version: escena.version });
      res.set('Location', `${req.baseUrl}/${trabajo.id}`).status(202).json({ ok: true, data: trabajo });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/:id')
    .get((req, res) => res.status(200).json({ ok: true, data: granja.obtener(leerId(req.params.id)) }))
    .delete(identificarCliente, (req, res) => {
      res.status(200).json({ ok: true, data: granja.cancelar(leerId(req.params.id), req.cliente) });
    })
    .all(metodoNoPermitido(['GET', 'DELETE']));

  return router;
}
