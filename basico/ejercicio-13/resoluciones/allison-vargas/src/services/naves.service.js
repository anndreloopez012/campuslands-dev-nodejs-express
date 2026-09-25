import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError } from '../utils/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_NAVES = path.join(__dirname, '..', 'data', 'naves.json');

export async function listarNaves() {
  const contenido = await readFile(RUTA_NAVES, 'utf-8');
  return JSON.parse(contenido);
}

export async function buscarNavePorId(id) {
  const naves = await listarNaves();
  const nave = naves.find((n) => n.id === Number(id));

  if (!nave) {
    throw new AppError(`No existe una nave con id ${id}`, 404);
  }

  return nave;
}
