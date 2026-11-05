import { loadJson } from '../utils/loadJson.js';
import { crearServicioMisiones } from './misiones.service.js';

export function crearServicios({ reloj = () => new Date(), naves = loadJson('naves.json') } = {}) {
  return { misiones: crearServicioMisiones({ naves: structuredClone(naves), reloj }) };
}
