import express, { Router } from 'express';
import { cicloDeVida } from '../../middlewares/cicloDeVida.js';
import { crearManejador, formatoProblema } from '../../middlewares/errores.js';
import { metodoNoPermitido } from '../../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../../middlewares/exigirJson.js';
import { notFound } from '../../middlewares/notFound.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { paginar } from '../../utils/paginacion.js';
import { ValidationError } from '../../utils/errors.js';
import { validarCuerpo } from '../../validators/esquema.js';
import { validarId } from '../../validators/id.validator.js';
import { leerListado, filtroEntero, filtroEnum } from '../../validators/consulta.js';
import { esquemaEdicionV2, esquemaPersonajeV2 } from '../../validators/schemas.js';
import { BASE_POR_CLASE, CLASES, NIVEL_MAX } from '../../constants/rpg.js';
import { estadoDeVersion } from '../../domain/ciclo.js';
import { construirEnlaces, presentarV2 } from './presenter.js';

const configListado = {
  filtros: {
    clase: filtroEnum(CLASES),
    nivelMin: filtroEntero(1, NIVEL_MAX),
    nivelMax: filtroEntero(1, NIVEL_MAX),
    buscar: (texto, error) => {
      if (texto.length < 1 || texto.length > 20) {
        error('debe tener entre 1 y 20 caracteres');
        return undefined;
      }
      return texto;
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
    nivel: (a, b) => a.nivel - b.nivel || a.id - b.id,
    nivel_desc: (a, b) => b.nivel - a.nivel || a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

export function crearV2({ personajes, definicion, reloj, base }) {
  const router = Router();
  const enviar = (res, data, status = 200) => res.status(status).json({ data });

  router.use(cicloDeVida(definicion, { reloj, base }));
  router.use(express.json({ limit: '10kb' }));

  router.route('/')
    .get((req, res) => enviar(res, {
      version: definicion.version,
      estado: estadoDeVersion(definicion, reloj()),
      sucesora: definicion.sucesora,
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/clases')
    .get((req, res) => enviar(res, CLASES.map((id) => ({ id, atributosBase: BASE_POR_CLASE[id] }))))
    .all(metodoNoPermitido(['GET']));

  router.route('/personajes')
    .get(catchAsync((req, res) => {
      const consulta = leerListado(req.query, configListado);
      const { clase, nivelMin, nivelMax, buscar } = consulta.filtros;
      if (nivelMin !== undefined && nivelMax !== undefined && nivelMin > nivelMax) {
        throw new ValidationError('Parametros de consulta invalidos', [
          { campo: 'nivelMin', mensaje: 'no puede ser mayor que nivelMax' },
        ], 'CONSULTA_INVALIDA');
      }
      const lista = personajes.listar({ clase, nivelMin, nivelMax, texto: buscar }, consulta.comparador);
      const { data, paginacion } = paginar(lista.map(presentarV2), consulta.pagina, consulta.limite);
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ data, meta: paginacion, links: construirEnlaces(req, paginacion) });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const creado = personajes.crear(validarCuerpo(req.body, esquemaPersonajeV2));
      res.set('Location', `${req.baseUrl}/personajes/${creado.id}`);
      enviar(res, presentarV2(creado), 201);
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/personajes/:id')
    .get(catchAsync((req, res) => enviar(res, presentarV2(personajes.obtener(validarId(req.params.id))))))
    .patch(exigirJson, catchAsync((req, res) => {
      const id = validarId(req.params.id);
      enviar(res, presentarV2(personajes.actualizar(id, validarCuerpo(req.body, esquemaEdicionV2, { parcial: true }))));
    }))
    .delete(catchAsync((req, res) => {
      personajes.eliminar(validarId(req.params.id));
      res.status(204).end();
    }))
    .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

  router.use(notFound);
  router.use(crearManejador(formatoProblema(base)));
  return router;
}
