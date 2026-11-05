import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { crearEquiposService } from './equipos.service.js';
import { crearTorneosService } from './torneos.service.js';

export function crearServicios({ reloj } = {}) {
  const inscripcionesRepositorio = new MemoryRepository(loadJson('inscripciones.json'));

  const equipos = crearEquiposService({
    repositorio: new MemoryRepository(loadJson('equipos.json')),
    inscripcionesRepositorio,
    reloj,
  });
  const torneos = crearTorneosService({
    repositorio: new MemoryRepository(loadJson('torneos.json')),
    inscripcionesRepositorio,
    equipos,
    reloj,
  });

  return { equipos, torneos };
}
