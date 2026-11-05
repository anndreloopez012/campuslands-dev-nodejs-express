import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_MANUALS_DIR = path.resolve(__dirname, '../data/manuales');

export function getSafeManualContent(userInputFileName) {
  if (!userInputFileName || typeof userInputFileName !== 'string' || userInputFileName.trim() === '') {
    throw new Error('Debe especificar el nombre del archivo del manual de taller.');
  }

  // Prevenir Path Traversal con path.join y verificación de ruta base
  const safePath = path.resolve(BASE_MANUALS_DIR, userInputFileName.trim());

  if (!safePath.startsWith(BASE_MANUALS_DIR)) {
    throw new Error('Acceso no autorizado: Intento de evasión de directorio detectado (Directory Traversal).');
  }

  if (!fs.existsSync(safePath)) {
    throw new Error(`El manual '${userInputFileName}' no existe en el repositorio del taller.`);
  }

  const content = fs.readFileSync(safePath, 'utf-8');
  return {
    archivo: path.basename(safePath),
    extension: path.extname(safePath),
    rutaSegura: safePath,
    contenido: content
  };
}
