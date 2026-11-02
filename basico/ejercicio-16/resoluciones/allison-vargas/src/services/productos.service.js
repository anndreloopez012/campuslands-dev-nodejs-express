import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PRODUCTOS = path.join(__dirname, '..', 'data', 'productos.json');

export async function listarProductos() {
  const contenido = await readFile(RUTA_PRODUCTOS, 'utf-8');
  return JSON.parse(contenido);
}
