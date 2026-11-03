import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const items = JSON.parse(readFileSync(path.join(dirname, '../data/misiones.json'), 'utf-8'));

export const listar = () => items;
export const buscarPorId = (id) => items.find((item) => item.id === id);
