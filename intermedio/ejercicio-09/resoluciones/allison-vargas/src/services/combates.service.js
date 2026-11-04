import { loadJson } from '../utils/loadJson.js';
import { consultar } from './consulta.service.js';
import { obtener as obtenerPeleador } from './peleadores.service.js';
import { combatesConsulta } from '../validators/consultas/combates.consulta.js';

const combates = loadJson('combates.json');

export const listar = (query) => consultar(combates, query, combatesConsulta);

export function listarPorPeleador(peleadorId, query) {
  obtenerPeleador(peleadorId);
  const { peleadorId: _ignorado, ...resto } = query;
  return consultar(
    combates.filter((c) => c.peleadorId === peleadorId),
    resto,
    combatesConsulta
  );
}
