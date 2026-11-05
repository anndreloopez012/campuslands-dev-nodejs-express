import express, { Router } from 'express';
import { cicloDeVida } from '../../middlewares/cicloDeVida.js';
import { crearManejador, formatoClasico } from '../../middlewares/errores.js';
import { metodoNoPermitido } from '../../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../../middlewares/exigirJson.js';
import { notFound } from '../../middlewares/notFound.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { ValidationError } from '../../utils/errors.js';
import { validarCuerpo } from '../../validators/esquema.js';
import { validarId } from '../../validators/id.validator.js';
import { esquemaPersonajeV1 } from '../../validators/schemas.js';
import { CLASES } from '../../constants/rpg.js';
import { estadoDeVersion } from '../../domain/ciclo.js';
import { presentarV1 } from './presenter.js';

function leerFiltros(query) {
  const errores = [];
  for (const [clave, valor] of Object.entries(query)) {
    if (clave !== 'clase') errores.push({ campo: clave, mensaje: 'parametro no permitido' });
    else if (typeof valor !== 'string' || !CLASES.includes(valor)) {
      errores.push({ campo: 'clase', mensaje: `debe ser uno de: ${CLASES.join(', ')}` });
    }
  }
  if (errores.length) throw new ValidationError('Parametros de consulta invalidos', errores, 'CONSULTA_INVALIDA');
  return { clase: query.clase };
}

export function crearV1({ personajes, definicion, reloj, base }) {
  const router = Router();
  const enviar = (res, data, status = 200) => res.status(status).json({ ok: true, data });

  router.use(cicloDeVida(definicion, { reloj, base }));
  router.use(express.json({ limit: '10kb' }));

  router.route('/')
    .get((req, res) => enviar(res, {
      version: definicion.version,
      estado: estadoDeVersion(definicion, reloj()),
      sucesora: definicion.sucesora,
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/personajes')
    .get(catchAsync((req, res) => {
      const lista = personajes.listar(leerFiltros(req.query)).map(presentarV1);
      res.status(200).json({ ok: true, data: lista, total: lista.length });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const creado = personajes.crear(validarCuerpo(req.body, esquemaPersonajeV1));
      res.set('Location', `${req.baseUrl}/personajes/${creado.id}`);
      enviar(res, presentarV1(creado), 201);
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/personajes/:id')
    .get(catchAsync((req, res) => enviar(res, presentarV1(personajes.obtener(validarId(req.params.id))))))
    .all(metodoNoPermitido(['GET']));

  router.use(notFound);
  router.use(crearManejador(formatoClasico));
  return router;
}
