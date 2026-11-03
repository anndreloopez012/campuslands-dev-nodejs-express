import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class JugadoresRepository extends MemoryRepository {
  findByEquipo(equipoId) {
    return this.findAll((j) => j.equipoId === equipoId);
  }

  findByDorsal(equipoId, dorsal) {
    return this.findOne((j) => j.equipoId === equipoId && j.dorsal === dorsal);
  }

  countByEquipo(equipoId) {
    return this.count((j) => j.equipoId === equipoId);
  }
}

export const jugadoresRepository = new JugadoresRepository(loadJson('jugadores.json'));
