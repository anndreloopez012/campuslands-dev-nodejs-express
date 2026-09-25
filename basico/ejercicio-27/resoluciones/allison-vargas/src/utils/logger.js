import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_LOGS = path.join(__dirname, '..', '..', 'logs');
const ARCHIVO_LOG = path.join(CARPETA_LOGS, 'app.log');

if (!fs.existsSync(CARPETA_LOGS)) {
  fs.mkdirSync(CARPETA_LOGS, { recursive: true });
}

function escribirLinea(nivel, mensaje) {
  const linea = `[${new Date().toISOString()}] [${nivel}] ${mensaje}`;
  console.log(linea);
  fs.appendFileSync(ARCHIVO_LOG, linea + '\n', 'utf-8');
}

export function logInfo(mensaje) {
  escribirLinea('INFO', mensaje);
}

export function logError(mensaje) {
  escribirLinea('ERROR', mensaje);
}

export function leerUltimasLineas(cantidad = 20) {
  if (!fs.existsSync(ARCHIVO_LOG)) {
    return [];
  }

  const contenido = fs.readFileSync(ARCHIVO_LOG, 'utf-8');
  const lineas = contenido.split('\n').filter((linea) => linea.trim().length > 0);

  return lineas.slice(-cantidad);
}
