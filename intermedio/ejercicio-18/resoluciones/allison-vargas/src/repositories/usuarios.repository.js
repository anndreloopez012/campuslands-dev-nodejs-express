import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

class UsuariosRepository extends MemoryRepository {
  buscarPorEmail(email) {
    return this.listar((usuario) => usuario.email === email)[0] ?? null;
  }
}

export const usuariosRepository = new UsuariosRepository(loadJson('usuarios.json'));
