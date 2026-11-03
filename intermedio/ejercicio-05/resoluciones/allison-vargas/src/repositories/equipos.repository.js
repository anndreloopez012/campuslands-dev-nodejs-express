import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class EquiposRepository extends MemoryRepository {
  findByNombre(nombre) {
    return this.findOne((e) => e.nombre.toLowerCase() === nombre.toLowerCase());
  }

  findByDeporte(deporte) {
    return this.findAll((e) => e.deporte === deporte);
  }
}

export const equiposRepository = new EquiposRepository(loadJson('equipos.json'));
