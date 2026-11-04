import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const toursRepository = new MemoryRepository(loadJson('tours.json'));
