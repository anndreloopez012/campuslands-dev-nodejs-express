import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class ResenasRepository extends MemoryRepository {
  porPelicula(peliculaId) {
    return this.listar((resena) => resena.peliculaId === peliculaId);
  }

  eliminarPorPelicula(peliculaId) {
    return this.eliminarDonde((resena) => resena.peliculaId === peliculaId);
  }
}

export const resenasRepository = new ResenasRepository(loadJson('resenas.json'));
