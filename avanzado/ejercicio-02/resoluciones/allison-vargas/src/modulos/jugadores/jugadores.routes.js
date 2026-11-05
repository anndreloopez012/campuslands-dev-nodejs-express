import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { paginar } from '../../utils/paginacion.js';
import { exigirJson } from '../../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../../middlewares/metodoNoPermitido.js';
import { validarCuerpo } from '../../validators/esquema.js';
import { validarId } from '../../validators/id.validator.js';
import { leerListado, filtroEnum } from '../../validators/consulta.js';
import { REGIONES } from '../../constants/dominio.js';
import { esquemaJugador } from './jugadores.schema.js';

const configListado = {
  filtros: {
    region: filtroEnum(REGIONES),
    buscar: (texto, error) => {
      if (texto.length < 1 || texto.length > 16) {
        error('debe tener entre 1 y 16 caracteres');
        return undefined;
      }
      return texto;
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    alias: (a, b) => a.alias.localeCompare(b.alias),
  },
  ordenPorDefecto: 'id',
};

export function crearJugadoresRouter({ jugadores }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const consulta = leerListado(req.query, configListado);
      const lista = jugadores.listar(consulta.filtros, consulta.comparador);
      const { data, paginacion } = paginar(lista, consulta.pagina, consulta.limite);
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync(async (req, res) => {
      const creado = await jugadores.crear(validarCuerpo(req.body, esquemaJugador));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      res.status(201).json({ ok: true, data: creado });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: jugadores.obtener(validarId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
