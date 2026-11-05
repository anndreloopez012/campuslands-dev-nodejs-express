import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { crearEquiposService } from './equipos.service.js';
import { crearPartidosService } from './partidos.service.js';
import { crearTablaService } from './tabla.service.js';

export function crearServicios({ datos = {} } = {}) {
  const equipos = crearEquiposService({
    repositorio: new MemoryRepository(datos.equipos ?? loadJson('equipos.json')),
  });
  const partidos = crearPartidosService({
    repositorio: new MemoryRepository(datos.partidos ?? loadJson('partidos.json')),
    equipos,
  });
  const tabla = crearTablaService({ equipos, partidos });
  return { equipos, partidos, tabla };
}
