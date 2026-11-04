import { loadJson } from '../utils/loadJson.js';
import { NotFoundError } from '../utils/errors.js';
import { consultar } from './consulta.service.js';
import { peleadoresConsulta } from '../validators/consultas/peleadores.consulta.js';

const peleadores = loadJson('peleadores.json');

export const listar = (query) => consultar(peleadores, query, peleadoresConsulta);

export function obtener(id) {
  const peleador = peleadores.find((p) => p.id === id);
  if (!peleador) throw new NotFoundError('El peleador no existe', 'PELEADOR_NO_ENCONTRADO');
  return peleador;
}
