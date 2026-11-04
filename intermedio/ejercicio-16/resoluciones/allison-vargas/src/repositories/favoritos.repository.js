import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const favoritosRepository = new MemoryRepository(loadJson('favoritos.json'));
