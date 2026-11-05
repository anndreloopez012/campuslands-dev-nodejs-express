import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { consultaMovimientos, consultaTransacciones } from '../validators/consultas.js';

const soloGet = (router, ruta, manejador) => {
  router.route(ruta).get(catchAsync(manejador)).all(metodoNoPermitido(['GET']));
};

export function crearLibroRouter({ movimientos, transacciones, notificaciones, auditoria, agentes }) {
  const router = Router();

  soloGet(router, '/movimientos', (req, res) => {
    const { data, paginacion } = movimientos.listar(consultaMovimientos(req.query));
    res.set('X-Total-Count', String(paginacion.total));
    res.status(200).json({ ok: true, data, paginacion });
  });

  soloGet(router, '/transacciones', (req, res) => {
    const data = transacciones.listar(consultaTransacciones(req.query));
    res.status(200).json({ ok: true, data, total: data.length });
  });

  soloGet(router, '/notificaciones', (req, res) => {
    const data = notificaciones.listar();
    res.status(200).json({ ok: true, data, total: data.length });
  });

  soloGet(router, '/auditoria', (req, res) => {
    res.status(200).json({ ok: true, data: auditoria.verificar() });
  });

  soloGet(router, '/agentes', (req, res) => {
    res.status(200).json({ ok: true, data: agentes.listar() });
  });

  return router;
}
