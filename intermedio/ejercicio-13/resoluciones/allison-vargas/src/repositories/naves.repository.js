import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const navesRepository = new MemoryRepository(loadJson('naves.json'));
