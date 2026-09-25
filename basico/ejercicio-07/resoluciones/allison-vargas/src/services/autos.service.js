import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_AUTOS = path.join(__dirname, '..', 'data', 'autos.json');

export async function listarAutos() {
  const contenido = await readFile(RUTA_AUTOS, 'utf-8');
  return JSON.parse(contenido);
}

export async function filtrarPorMarca(marca) {
  const autos = await listarAutos();

  if (!marca) {
    return autos;
  }

  return autos.filter((auto) => auto.marca.toLowerCase() === marca.toLowerCase());
}
