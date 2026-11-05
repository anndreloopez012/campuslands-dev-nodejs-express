import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const escenasRepository = new MemoryRepository(loadJson('escenas.json'));
