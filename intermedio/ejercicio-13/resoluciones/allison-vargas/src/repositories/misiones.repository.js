import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class MisionesRepository extends MemoryRepository {
  porNave(naveId) {
    return this.listar((mision) => mision.naveId === naveId);
  }
}

export const misionesRepository = new MisionesRepository(loadJson('misiones.json'));
