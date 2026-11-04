import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const productosRepository = new MemoryRepository(loadJson('productos.json'));
