import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const destinosRepository = new MemoryRepository(loadJson('destinos.json'));
