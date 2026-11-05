import express, { Router } from 'express';
import { crearServicioProductos } from './services/productos.service.js';
import { crearProductosRouter, crearSanitizarRouter } from './routes/productos.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { loadJson } from './utils/loadJson.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({
  productos = crearServicioProductos({ productos: loadJson('productos.json') }),
  registro = registroPorDefecto,
} = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  // "simple" usa querystring de node: ?a[b]=1 no se convierte en objeto anidado (eso abre la puerta a inyecciones)
  app.set('query parser', 'simple');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'sanitizacion de entrada' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/productos', crearProductosRouter({ productos }));
  router.use('/sanitizar', crearSanitizarRouter());

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp();
