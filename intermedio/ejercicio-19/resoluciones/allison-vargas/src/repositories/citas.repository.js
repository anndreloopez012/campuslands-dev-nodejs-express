import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const citasRepository = new MemoryRepository(loadJson('citas.json'));
