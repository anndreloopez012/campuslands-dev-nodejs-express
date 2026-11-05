import { MemoryRepository } from './memory.repository.js';
import { loadJson } from '../utils/loadJson.js';

export const proyectosRepository = new MemoryRepository(loadJson('proyectos.json'));
