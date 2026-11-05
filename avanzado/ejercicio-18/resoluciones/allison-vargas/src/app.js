import express, { Router } from 'express';
import { crearMotor } from './autorizacion/motor.js';
import { CONDICIONES, PROHIBICIONES, ROLES } from './autorizacion/politicas.js';
import { crearServicioZona } from './services/zona.service.js';
import { crearZonaRouter } from './routes/zona.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { loadJson } from './utils/loadJson.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearServicios({
  reloj = () => new Date(),
  usuarios = loadJson('usuarios.json'),
  vuelos = loadJson('vuelos.json'),
} = {}) {
  const motor = crearMotor({ roles: ROLES, condiciones: CONDICIONES, prohibiciones: PROHIBICIONES });
  return {
    motor,
    zona: crearServicioZona({
      motor, usuarios: structuredClone(usuarios), vuelos, reloj,
    }),
  };
}

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  app.set('query parser', 'simple');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'multirol avanzado' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/', crearZonaRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp();
