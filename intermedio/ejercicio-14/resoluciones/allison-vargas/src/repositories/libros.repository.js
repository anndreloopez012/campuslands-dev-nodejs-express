import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const librosRepository = new MemoryRepository(loadJson('libros.json'));
