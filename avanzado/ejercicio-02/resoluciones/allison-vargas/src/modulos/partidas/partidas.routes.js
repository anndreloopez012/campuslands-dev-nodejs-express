import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { paginar } from '../../utils/paginacion.js';
import { exigirJson } from '../../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../../middlewares/metodoNoPermitido.js';
import { validarCuerpo } from '../../validators/esquema.js';
import { validarId } from '../../validators/id.validator.js';
import { leerListado, filtroEntero, filtroEnum } from '../../validators/consulta.js';
import { ESTADOS_PARTIDA, ID_MAX, MAPAS } from '../../constants/dominio.js';
import { esquemaPartida, esquemaResultado } from './partidas.schema.js';

const configListado = {
  filtros: {
    estado: filtroEnum(ESTADOS_PARTIDA),
    mapa: filtroEnum(MAPAS),
    jugadorId: filtroEntero(1, ID_MAX),
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    id_desc: (a, b) => b.id - a.id,
  },
  ordenPorDefecto: 'id',
};

export function crearPartidasRouter({ partidas }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const consulta = leerListado(req.query, configListado);
      const lista = partidas.listar(consulta.filtros, consulta.comparador);
      const { data, paginacion } = paginar(lista, consulta.pagina, consulta.limite);
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const creada = partidas.crear(validarCuerpo(req.body, esquemaPartida));
      res.set('Location', `${req.baseUrl}/${creada.id}`);
      res.status(201).json({ ok: true, data: creada });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: partidas.obtener(validarId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/resultado')
    .post(exigirJson, catchAsync(async (req, res) => {
      const id = validarId(req.params.id);
      const final = await partidas.registrarResultado(id, validarCuerpo(req.body, esquemaResultado));
      res.status(200).json({ ok: true, data: final });
    }))
    .all(metodoNoPermitido(['POST']));

  return router;
}
