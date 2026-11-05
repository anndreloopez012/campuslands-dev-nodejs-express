import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const compuestosRepository = new MemoryRepository(loadJson('compuestos.json'));
