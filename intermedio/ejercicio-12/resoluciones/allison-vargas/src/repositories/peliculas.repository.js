import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const peliculasRepository = new MemoryRepository(loadJson('peliculas.json'));
