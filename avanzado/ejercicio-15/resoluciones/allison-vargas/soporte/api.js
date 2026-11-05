import { crearApp } from '../src/app.js';
import { levantar } from './cliente.js';

export async function levantarApi(opciones = {}) {
  let contador = 0;
  const app = crearApp({
    nonce: () => {
      contador += 1;
      return `nonce${contador}`;
    },
    registro: () => {},
    ...opciones,
  });
  return levantar(app);
}

export const ORIGEN_OK = 'http://localhost:5173';
export const ORIGEN_MALO = 'https://evil.example';
