import express, { Router } from 'express';
import { cargarConfig } from './config/index.js';
import { crearContenedor } from './core/contenedor.js';
import { crearBusEventos } from './core/eventos.js';
import { crearCache } from './core/cache.js';
import { crearLogger } from './core/logger.js';
import { ordenarModulos } from './core/modulos.js';
import { MODULOS } from './modulos/index.js';
import { idPeticion } from './middlewares/idPeticion.js';
import { bitacora } from './middlewares/bitacora.js';
import { almacenEnMemoria, limitador } from './middlewares/limitador.js';
import { manejadorDeErrores } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

const MAX_ENTRADAS_CACHE = 500;

export function crearApp({
  env = process.env,
  config = cargarConfig(env),
  reloj = () => new Date(),
  logger = crearLogger({ reloj }),
  modulos = MODULOS,
  sobreescribir = {},
} = {}) {
  const ordenados = ordenarModulos(modulos);
  const contenedor = crearContenedor();

  contenedor.registrar('config', () => config);
  contenedor.registrar('reloj', () => reloj);
  contenedor.registrar('logger', () => logger);
  contenedor.registrar('eventos', (c) => crearBusEventos({ logger: c.resolver('logger') }));
  contenedor.registrar('cache', (c) => crearCache({
    reloj: c.resolver('reloj'),
    ttlMs: c.resolver('config').cache.ttlMs,
    maxEntradas: MAX_ENTRADAS_CACHE,
  }));
  contenedor.registrar('limitador.almacen', (c) => almacenEnMemoria({ reloj: c.resolver('reloj') }));

  ordenados.forEach((modulo) => modulo.registrar(contenedor));
  for (const [nombre, valor] of Object.entries(sobreescribir)) contenedor.reemplazar(nombre, () => valor);
  ordenados.forEach((modulo) => modulo.alIniciar?.(contenedor));

  const app = express();
  const router = Router();
  const estadoApp = { apagando: false };
  const iniciadoEn = reloj().toISOString();

  app.set('query parser', 'simple');
  app.disable('x-powered-by');
  if (config.proxies > 0) app.set('trust proxy', config.proxies);

  app.use(idPeticion(logger));
  app.use(bitacora());
  app.use((req, res, next) => {
    if (estadoApp.apagando) res.set('Connection', 'close');
    next();
  });

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'arquitectura escalable',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/salud')
    .get((req, res) => {
      res.set('Cache-Control', 'no-store');
      res.status(200).json({ ok: true, estado: 'vivo', entorno: config.entorno, iniciadoEn });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/listo')
    .get((req, res) => {
      res.set('Cache-Control', 'no-store');
      if (estadoApp.apagando) return res.status(503).json({ ok: false, estado: 'apagando' });
      const reporte = ordenados.map((modulo) => {
        try {
          const resultado = modulo.estado ? modulo.estado(contenedor) : { ok: true };
          return { nombre: modulo.nombre, ok: resultado.ok === true, detalle: resultado.detalle };
        } catch (error) {
          return { nombre: modulo.nombre, ok: false, detalle: { error: error.message } };
        }
      });
      const listo = reporte.every((modulo) => modulo.ok);
      return res.status(listo ? 200 : 503).json({
        ok: listo,
        estado: listo ? 'listo' : 'no_listo',
        modulos: reporte,
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/modulos')
    .get((req, res) => {
      const data = ordenados.map((modulo) => ({
        nombre: modulo.nombre,
        ruta: `${BASE_RUTAS}${modulo.ruta}`,
        dependencias: modulo.dependencias ?? [],
        emite: modulo.emite ?? [],
        escucha: modulo.escucha ?? [],
      }));
      res.status(200).json({ ok: true, data });
    })
    .all(metodoNoPermitido(['GET']));

  router.use(limitador({
    almacen: contenedor.resolver('limitador.almacen'),
    maximo: config.limite.maximo,
    ventanaMs: config.limite.ventanaMs,
    reloj,
  }));
  router.use(express.json({ limit: '10kb' }));
  ordenados.forEach((modulo) => router.use(modulo.ruta, modulo.crearRouter(contenedor)));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores());

  app.contenedor = contenedor;
  app.modulos = ordenados;
  app.marcarApagando = () => {
    estadoApp.apagando = true;
  };
  app.detenerModulos = async () => {
    for (const modulo of [...ordenados].reverse()) await modulo.alDetener?.(contenedor);
  };

  return app;
}

export default crearApp();
