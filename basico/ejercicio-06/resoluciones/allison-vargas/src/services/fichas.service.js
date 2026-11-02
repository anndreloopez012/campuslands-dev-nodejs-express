import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIRECTORIO_FICHAS = path.join(__dirname, '..', 'data', 'fichas');

export function construirRutaSegura(nombreModelo) {
  const nombreNormalizado = path.normalize(nombreModelo);
  const rutaCompleta = path.resolve(DIRECTORIO_FICHAS, `${nombreNormalizado}.json`);

  const esRutaSegura = rutaCompleta.startsWith(DIRECTORIO_FICHAS + path.sep);

  if (!esRutaSegura) {
    const error = new Error('Ruta invalida: intento de acceso fuera del directorio permitido');
    error.code = 'RUTA_INVALIDA';
    throw error;
  }

  return rutaCompleta;
}

export async function obtenerFichaPorModelo(nombreModelo) {
  const rutaSegura = construirRutaSegura(nombreModelo);
  const contenido = await readFile(rutaSegura, 'utf-8');
  return JSON.parse(contenido);
}
