import { Fuente } from '../src/domain/fuente.js';
import { crearServicioCombates } from '../src/services/combates.service.js';
import { crearServicioPeleadores } from '../src/services/peleadores.service.js';
import { loadJson } from '../src/utils/loadJson.js';

export const peleadores = loadJson('peleadores.json');

export class FuenteEspia extends Fuente {
  lecturas = 0;

  obtener(id) {
    this.lecturas += 1;
    return super.obtener(id);
  }
}

export function crearEntorno({ total = 500 } = {}) {
  const fuente = new FuenteEspia({ peleadores, total });
  return {
    fuente,
    servicios: {
      combates: crearServicioCombates({ fuente, peleadores }),
      peleadores: crearServicioPeleadores({ peleadores, fuente }),
    },
  };
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

export const COMBATE_BASE = {
  fecha: '2026-03-10',
  categoria: 'ligero',
  rojoId: 1,
  azulId: 2,
  ganadorId: 1,
  metodo: 'ko',
  rounds: 2,
  golpesRojo: 40,
  golpesAzul: 12,
};

export const lineas = (...combates) => `${combates.map((c) => (typeof c === 'string' ? c : JSON.stringify(c))).join('\n')}\n`;

export const pausa = (ms) => new Promise((resolver) => { setTimeout(resolver, ms); });

export const filasNdjson = (cuerpo) => {
  if (cuerpo === null || cuerpo === '') return [];
  if (typeof cuerpo !== 'string') return [cuerpo];
  return cuerpo.trim().split('\n').map((l) => JSON.parse(l));
};
