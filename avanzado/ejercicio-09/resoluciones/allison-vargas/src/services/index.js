import { TOTAL_COMBATES } from '../constants/combates.js';
import { Fuente } from '../domain/fuente.js';
import { loadJson } from '../utils/loadJson.js';
import { crearServicioCombates } from './combates.service.js';
import { crearServicioPeleadores } from './peleadores.service.js';

export function crearServicios({ total = TOTAL_COMBATES, peleadores = loadJson('peleadores.json') } = {}) {
  const fuente = new Fuente({ peleadores, total });
  return {
    combates: crearServicioCombates({ fuente, peleadores }),
    peleadores: crearServicioPeleadores({ peleadores, fuente }),
  };
}
