import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class TripulantesRepository extends MemoryRepository {
  porNave(naveId) {
    return this.listar((tripulante) => tripulante.naveId === naveId);
  }
}

export const tripulantesRepository = new TripulantesRepository(loadJson('tripulantes.json'));
