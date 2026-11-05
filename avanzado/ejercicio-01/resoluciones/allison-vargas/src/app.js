import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearV1 } from './versions/v1/index.js';
import { crearV2 } from './versions/v2/index.js';
import { crearManejador, formatoClasico } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { AppError } from './utils/errors.js';
import { BASE_RUTAS } from './constants/rutas.js';
import { VERSIONES } from './constants/versiones.js';
import { estadoDeVersion } from './domain/ciclo.js';

const VERSION_EN_RUTA = /^\/v\d+(\/|$)/;

export function crearApp({ servicios = crearServicios(), reloj = () => new Date(), versiones = VERSIONES } = {}) {
  const app = express();
  const router = Router();
  const [definicionV1, definicionV2] = versiones;
  const contexto = { personajes: servicios.personajes, reloj, base: BASE_RUTAS };

  app.set('query parser', 'simple');
  app.disable('x-powered-by');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'diseno API versionada',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/versiones')
    .get((req, res) => {
      const data = versiones.map((definicion) => ({
        version: definicion.version,
        estado: estadoDeVersion(definicion, reloj()),
        ruta: `${BASE_RUTAS}/${definicion.version}`,
        deprecadaDesde: definicion.deprecadaDesde,
        retiroPrevisto: definicion.retiroPrevisto,
        sucesora: definicion.sucesora,
        cambiosRotos: definicion.cambiosRotos,
      }));
      res.status(200).json({ ok: true, data });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/v1', crearV1({ ...contexto, definicion: definicionV1 }));
  router.use('/v2', crearV2({ ...contexto, definicion: definicionV2 }));

  router.use((req, res, next) => {
    if (!VERSION_EN_RUTA.test(req.path)) return next();
    const disponibles = versiones.map((definicion) => definicion.version).join(', ');
    return next(new AppError(
      `La version solicitada no existe. Versiones disponibles: ${disponibles}`,
      404,
      'VERSION_NO_SOPORTADA',
    ));
  });

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(crearManejador(formatoClasico));

  return app;
}

export default crearApp();
