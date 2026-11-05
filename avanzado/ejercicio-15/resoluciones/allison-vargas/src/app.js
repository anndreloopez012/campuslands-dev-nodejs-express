import express, { Router } from 'express';
import { crearServicioPuestos } from './services/puestos.service.js';
import { crearPedidosRouter, crearPuestosRouter } from './routes/puestos.routes.js';
import { crearSeguridadRouter } from './routes/seguridad.routes.js';
import { cabecerasSeguras } from './seguridad/cabeceras.js';
import { cors } from './seguridad/cors.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { loadJson } from './utils/loadJson.js';
import { BASE_RUTAS } from './constants/rutas.js';

export const ORIGENES_POR_DEFECTO = ['http://localhost:5173', /^https:\/\/[a-z0-9-]+\.comida-urbana\.test$/];

export function crearApp({
  reloj = () => new Date(),
  puestos = crearServicioPuestos({ puestos: loadJson('puestos.json'), reloj }),
  origenes = ORIGENES_POR_DEFECTO,
  confiarEnProxy = false,
  nonce,
  registro = registroPorDefecto,
} = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  app.set('query parser', 'simple');
  // solo con un proxy de confianza se acepta X-Forwarded-Proto para saber si la conexion es https
  app.set('trust proxy', confiarEnProxy);

  app.use(cabecerasSeguras({ reporteCsp: `${BASE_RUTAS}/csp-reportes`, nonce }));
  app.use(cors({
    origenes,
    metodos: ['GET', 'POST'],
    cabeceras: ['Content-Type', 'X-Request-Id'],
    expuestas: ['Location'],
    credenciales: true,
  }));

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'seguridad de headers' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/puestos', crearPuestosRouter({ puestos }));
  router.use('/pedidos', crearPedidosRouter({ puestos }));
  router.use('/', crearSeguridadRouter({ puestos }));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp({ confiarEnProxy: process.env.TRUST_PROXY ?? false });
