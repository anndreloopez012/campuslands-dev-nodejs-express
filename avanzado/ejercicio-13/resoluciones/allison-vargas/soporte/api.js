import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { crearMemoria } from '../src/observabilidad/destinos.js';
import { levantar } from './cliente.js';

export const INICIO = new Date('2026-11-05T12:00:00.000Z');

export function crearReloj(inicio = INICIO) {
  let actual = inicio.getTime();
  return {
    reloj: () => new Date(actual),
    avanzar: (ms) => { actual += ms; },
  };
}

export function crearCronometro(pasoMs = 5) {
  let actual = 0n;
  return () => {
    actual += BigInt(pasoMs * 1e6);
    return actual;
  };
}

export async function levantarApi({ servicios, nivel = 'info', destinos = [] } = {}) {
  const tiempo = crearReloj();
  const memoria = crearMemoria({ capacidad: 200 });
  let contador = 0;
  const app = crearApp({
    reloj: tiempo.reloj,
    servicios: servicios ?? crearServicios({ reloj: tiempo.reloj }),
    memoria,
    destinos,
    nivel,
    ahora: crearCronometro(),
    generarId: () => {
      contador += 1;
      return `req-${String(contador).padStart(8, '0')}`;
    },
  });
  const api = await levantar(app);
  return {
    ...api,
    ...tiempo,
    memoria,
    logger: app.locals.logger,
    logsDe: (requestId) => memoria.consultar({ requestId, limite: 200 }).data.reverse(),
  };
}
