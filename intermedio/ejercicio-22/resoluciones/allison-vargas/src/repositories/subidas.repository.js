import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const subidasRepository = new MemoryRepository(loadJson('subidas.json'));
