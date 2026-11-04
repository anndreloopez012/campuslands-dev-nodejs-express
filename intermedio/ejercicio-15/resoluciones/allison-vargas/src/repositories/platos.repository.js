import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const platosRepository = new MemoryRepository(loadJson('platos.json'));
