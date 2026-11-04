import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const pedidosRepository = new MemoryRepository(loadJson('pedidos.json'));
