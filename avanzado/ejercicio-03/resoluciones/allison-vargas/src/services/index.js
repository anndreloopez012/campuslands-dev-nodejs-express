import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { esquemaHeroe } from '../validators/heroe.schema.js';
import { crearHeroesService } from './heroes.service.js';
import { crearEquiposService } from './equipos.service.js';
import { crearDraftsService } from './drafts.service.js';

export function crearServicios({ reloj = () => new Date(), datos = {} } = {}) {
  const heroes = crearHeroesService({
    repositorio: new MemoryRepository(datos.heroes ?? loadJson('heroes.json')),
    esquema: esquemaHeroe,
    reloj,
  });
  const equipos = crearEquiposService({
    repositorio: new MemoryRepository(datos.equipos ?? loadJson('equipos.json')),
    reloj,
  });
  const drafts = crearDraftsService({
    repositorio: new MemoryRepository(datos.drafts ?? []),
    heroes,
    equipos,
    reloj,
  });
  return { heroes, equipos, drafts };
}
