import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { crearJugadoresService } from './jugadores.service.js';
import { crearPartidasService } from './partidas.service.js';

export function crearServicios({ reloj } = {}) {
  const jugadores = crearJugadoresService({
    repositorio: new MemoryRepository(loadJson('jugadores.json')),
    reloj,
  });
  const partidas = crearPartidasService({
    repositorio: new MemoryRepository(loadJson('partidas.json')),
    jugadores,
    reloj,
  });
  return { jugadores, partidas };
}
