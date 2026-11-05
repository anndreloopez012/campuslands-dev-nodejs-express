import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const obrasRepository = new MemoryRepository(loadJson('obras.json'));
