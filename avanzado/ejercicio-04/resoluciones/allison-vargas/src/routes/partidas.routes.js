import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { validarConsultaPartidas, validarPartidaNueva } from '../validators/partida.js';
import { validarAccion, validarLote } from '../validators/acciones.js';

export function crearPartidasRouter({ partidas }) {
  const router = Router();

  const accion = (tipo, ejecutar) => catchAsync((req, res) => {
    const id = leerId(req.params.id);
    const datos = validarAccion(tipo, req.body);
    res.status(200).json({ ok: true, data: ejecutar(id, datos) });
  });

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = partidas.listar(validarConsultaPartidas(req.query));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const creada = partidas.crear(validarPartidaNueva(req.body));
      res.set('Location', `${req.baseUrl}/${creada.id}`);
      res.status(201).json({ ok: true, data: creada });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: partidas.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/eventos')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: partidas.eventos(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/iniciar')
    .post(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: partidas.iniciar(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/zona/avanzar')
    .post(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: partidas.avanzarZona(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['POST']));

  const rutasDeAccion = [
    ['unirse', (id, d) => partidas.unirse(id, d)],
    ['salir', (id, d) => partidas.salir(id, d)],
    ['mover', (id, d) => partidas.mover(id, d)],
    ['recoger', (id, d) => partidas.recoger(id, d)],
    ['disparar', (id, d) => partidas.disparar(id, d)],
    ['curar', (id, d) => partidas.curar(id, d)],
  ];
  for (const [tipo, ejecutar] of rutasDeAccion) {
    router.route(`/:id/${tipo}`)
      .post(exigirJson, accion(tipo, ejecutar))
      .all(metodoNoPermitido(['POST']));
  }

  router.route('/:id/acciones')
    .post(exigirJson, catchAsync((req, res) => {
      const id = leerId(req.params.id);
      const lote = validarLote(req.body);
      const data = partidas.ejecutarLote(id, lote, {
        instance: req.originalUrl,
        idPeticion: req.idPeticion,
      });
      res.status(200).json({ ok: true, data });
    }))
    .all(metodoNoPermitido(['POST']));

  return router;
}
