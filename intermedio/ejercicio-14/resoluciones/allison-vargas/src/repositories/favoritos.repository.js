import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class FavoritosRepository extends MemoryRepository {
  listarDeUsuario(usuarioId) {
    return this.listar((favorito) => favorito.usuarioId === usuarioId);
  }

  buscarDeUsuario(usuarioId, libroId) {
    return this.listar((favorito) => favorito.usuarioId === usuarioId && favorito.libroId === libroId)[0] ?? null;
  }

  eliminarDeLibro(libroId) {
    return this.eliminarDonde((favorito) => favorito.libroId === libroId);
  }
}

export const favoritosRepository = new FavoritosRepository(loadJson('favoritos.json'));
