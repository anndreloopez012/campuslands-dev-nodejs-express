import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const reservasRepository = new MemoryRepository(loadJson('reservas.json'));
