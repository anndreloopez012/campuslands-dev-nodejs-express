import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class RepartoRepository extends MemoryRepository {
  porPelicula(peliculaId) {
    return this.listar((miembro) => miembro.peliculaId === peliculaId);
  }

  eliminarPorPelicula(peliculaId) {
    return this.eliminarDonde((miembro) => miembro.peliculaId === peliculaId);
  }
}

export const repartoRepository = new RepartoRepository(loadJson('reparto.json'));
