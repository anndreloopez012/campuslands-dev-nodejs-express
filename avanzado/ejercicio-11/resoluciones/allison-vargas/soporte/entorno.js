import { crearServicios } from '../src/services/index.js';

export const AHORA = new Date('2026-11-05T12:00:00.000Z');

export const pausa = (ms) => new Promise((resolver) => { setTimeout(resolver, ms); });

export async function asentar(veces = 5) {
  for (let i = 0; i < veces; i += 1) {
    await new Promise((resolver) => { setImmediate(resolver); });
  }
}

export function crearCompuerta() {
  const esperando = [];
  let abierta = false;
  return {
    cederTurno: () => (abierta ? Promise.resolve() : new Promise((resolver) => { esperando.push(resolver); })),
    async liberarUno() {
      esperando.shift()?.();
      await asentar();
    },
    async abrir() {
      abierta = true;
      for (const resolver of esperando.splice(0)) resolver();
      await asentar();
    },
    get esperando() {
      return esperando.length;
    },
  };
}

export function crearEntorno({ reloj = () => AHORA, cederTurno, registro } = {}) {
  return { servicios: crearServicios({ reloj, cederTurno, registro }) };
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

export const isrcDe = (n) => `QZABC24${String(n).padStart(5, '0')}`;

export const cancion = (n = 1, cambios = {}) => ({
  isrc: isrcDe(n),
  titulo: `Tema ${n}`,
  artista: 'Luna Roja',
  album: 'Primer disco',
  anio: 2020,
  duracionSeg: 200,
  genero: 'rock',
  explicito: false,
  ...cambios,
});

export const lista = (cantidad, desde = 1) => Array.from({ length: cantidad }, (_, i) => cancion(desde + i));

export const ndjson = (...filas) => `${filas.map((f) => (typeof f === 'string' ? f : JSON.stringify(f))).join('\n')}\n`;
