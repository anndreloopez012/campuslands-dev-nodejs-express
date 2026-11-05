import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const tatuadoresRepository = new MemoryRepository(loadJson('tatuadores.json'));
