import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from './cliente.js';

export const INICIO = new Date('2026-11-05T12:00:00.000Z');
export const DIA = 24 * 60 * 60 * 1000;

export function crearReloj(inicio = INICIO) {
  let actual = inicio.getTime();
  return {
    reloj: () => new Date(actual),
    avanzar: (ms) => { actual += ms; },
  };
}

// cada llamada avanza 10 ms: una peticion mide exactamente 0.01 s
export function crearCronometro(pasoMs = 10) {
  let actual = 0n;
  return () => {
    actual += BigInt(pasoMs * 1e6);
    return actual;
  };
}

export async function levantarApi(opciones = {}) {
  const tiempo = crearReloj();
  const servicios = crearServicios({ reloj: tiempo.reloj, ...opciones });
  const api = await levantar(crearApp({ servicios, ahora: crearCronometro(), registro: () => {} }));
  return {
    ...api,
    ...tiempo,
    servicios,
    metricas: async () => (await api.pedir('/metrics')).cuerpo,
    prestar: (libroId, lector) => api.json('/prestamos', { libroId, lector }),
    devolver: (id) => api.pedir(`/prestamos/${id}/devolucion`, { method: 'POST' }),
  };
}

export function linea(texto, inicio) {
  return texto.split('\n').find((l) => l.startsWith(`${inicio} `));
}
