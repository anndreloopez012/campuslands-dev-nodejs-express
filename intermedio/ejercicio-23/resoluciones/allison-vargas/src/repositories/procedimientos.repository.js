import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const procedimientosRepository = new MemoryRepository(loadJson('procedimientos.json'));
