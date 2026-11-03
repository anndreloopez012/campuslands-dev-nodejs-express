import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PUESTOS = path.join(__dirname, '..', 'data', 'puestos.json');

export async function listarPuestos() {
  const contenido = await readFile(RUTA_PUESTOS, 'utf-8');
  return JSON.parse(contenido);
}

export async function buscarPuestoPorId(id) {
  const puestos = await listarPuestos();
  return puestos.find((p) => p.id === Number(id)) || null;
}
