import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { consultaEventos, consultaStream } from '../validators/pista.js';

export function crearEventosRouter({ eventos }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, siguiente } = eventos.consultar(consultaEventos(req.query));
      res.status(200).json({ ok: true, data, total: data.length, siguiente });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/stream')
    .get((req, res, next) => {
      let transmision;
      try {
        const filtro = consultaStream(req.query, req.get('last-event-id'));
        const enviar = (e) => res.write(`id: ${e.seq}\nevent: ${e.evento}\ndata: ${JSON.stringify(e)}\n\n`);
        transmision = eventos.transmitir(filtro, enviar);
      } catch (error) {
        return next(error);
      }
      res.status(200).set({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.flushHeaders();
      res.write(': conectado\n\n');
      transmision.repetir();
      return req.on('close', transmision.cerrar);
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:seq')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: eventos.obtener(leerId(req.params.seq, 'seq')) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
