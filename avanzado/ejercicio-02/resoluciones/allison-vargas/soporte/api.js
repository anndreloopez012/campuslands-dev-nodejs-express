import { crearApp } from '../src/app.js';
import { crearLogger } from '../src/core/logger.js';
import { levantar } from './cliente.js';

export const AHORA = new Date('2026-11-04T12:00:00.000Z');

export function crearReloj(inicio = AHORA) {
  let actual = inicio.getTime();
  const reloj = () => new Date(actual);
  reloj.avanzar = (ms) => {
    actual += ms;
  };
  return reloj;
}

export function crearApiDePrueba({ env = {}, reloj = crearReloj(), ...resto } = {}) {
  const logs = [];
  const logger = crearLogger({ salida: (linea) => logs.push(JSON.parse(linea)), reloj });
  const app = crearApp({ env: { NODE_ENV: 'test', ...env }, reloj, logger, ...resto });
  return { app, logs, reloj, contenedor: app.contenedor };
}

export async function levantarApi(opciones = {}) {
  const base = crearApiDePrueba(opciones);
  const cliente = await levantar(base.app);
  return { ...cliente, ...base };
}
