import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerUuid } from '../validators/auth.js';

const json = [exigirTipo('application/json'), express.json({ limit: '2kb' })];

export const autenticar = (auth) => (req, res, next) => {
  req.usuario = auth.autenticar(req.get('authorization'));
  next();
};

// las respuestas con tokens nunca deben quedar en una cache
const sinCache = (req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' });
  next();
};

export function crearAuthRouter({ auth }) {
  const router = Router();
  const protegida = autenticar(auth);
  router.use(sinCache);

  router.route('/login')
    .post(...json, (req, res) => {
      res.status(200).json({ ok: true, data: auth.login(req.body, { agente: req.get('user-agent'), ip: req.ip }) });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/refresh')
    .post(...json, (req, res) => {
      res.status(200).json({ ok: true, data: auth.refrescar(req.body) });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/logout')
    .post(protegida, (req, res) => {
      auth.cerrarSesion(req.usuario);
      res.status(204).end();
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/logout-todas')
    .post(protegida, (req, res) => {
      res.status(200).json({ ok: true, cerradas: auth.cerrarTodas(req.usuario) });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/yo')
    .get(protegida, (req, res) => {
      res.status(200).json({ ok: true, data: req.usuario });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/sesiones')
    .get(protegida, (req, res) => {
      res.status(200).json({ ok: true, data: auth.sesiones(req.usuario) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/sesiones/:id')
    .delete(protegida, (req, res) => {
      auth.cerrarSesionPorId(req.usuario, leerUuid(req.params.id));
      res.status(204).end();
    })
    .all(metodoNoPermitido(['DELETE']));

  return router;
}
