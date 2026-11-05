import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { crearPersonajesService } from './personajes.service.js';

export function crearServicios({ reloj = () => new Date(), datos = {} } = {}) {
  const personajes = crearPersonajesService({
    repositorio: new MemoryRepository(datos.personajes ?? loadJson('personajes.json')),
    reloj,
  });
  return { personajes };
}
