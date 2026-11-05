import { Cache } from '../src/domain/cache.js';
import { CacheAside } from '../src/domain/cargador.js';
import { crearServicios } from '../src/services/index.js';
import { crearEsperaControlable, crearReloj } from './datos.js';

export function crearCacheDePrueba(opciones = {}) {
  const tiempo = crearReloj();
  const cache = new Cache({ reloj: tiempo.reloj, ...opciones });
  return { cache, ...tiempo };
}

export function crearAsideDePrueba(opciones = {}) {
  const entorno = crearCacheDePrueba(opciones);
  return { ...entorno, aside: new CacheAside({ cache: entorno.cache }) };
}

export function crearEntorno(opciones = {}) {
  const tiempo = crearReloj();
  const compuerta = crearEsperaControlable();
  const servicios = crearServicios({ reloj: tiempo.reloj, espera: compuerta.espera, ...opciones });
  return { ...tiempo, compuerta, servicios };
}

export const rechazaCon = (codigo, contexto) => (error) => {
  if (error?.codigo !== codigo) return false;
  if (contexto) {
    for (const [clave, valor] of Object.entries(contexto)) {
      if (error.contexto[clave] !== valor) return false;
    }
  }
  return true;
};

export const AUTO_NUEVO = {
  marca: 'Ferrari',
  modelo: '296 GTB',
  anio: 2024,
  categoria: 'deportivo',
  precioUsd: 322000,
  potenciaHp: 819,
  vin: 'ZFF90SLA0R0310099',
};
