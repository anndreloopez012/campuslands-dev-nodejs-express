import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { crearPersonajesService } from './personajes.service.js';
import { crearInventarioService } from './inventario.service.js';
import { crearMisionesService } from './misiones.service.js';

export function crearServicios({ reloj } = {}) {
  const personajesRepo = new MemoryRepository(loadJson('personajes.json'));
  const inventarioRepo = new MemoryRepository(loadJson('inventario.json'));
  const misionesRepo = new MemoryRepository(loadJson('misiones.json'));

  const personajes = crearPersonajesService({
    repositorio: personajesRepo,
    inventarioRepositorio: inventarioRepo,
    reloj,
  });
  const inventario = crearInventarioService({ repositorio: inventarioRepo, personajes });
  const misiones = crearMisionesService({ repositorio: misionesRepo, personajes });

  return { personajes, inventario, misiones };
}
