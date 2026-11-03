import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carpetaLogs = path.join(__dirname, '..', '..', 'logs');
const archivoLogs = path.join(carpetaLogs, 'app.log');

export function escribirLog(linea) {
  if (!fs.existsSync(carpetaLogs)) {
    fs.mkdirSync(carpetaLogs);
  }

  fs.appendFileSync(archivoLogs, linea + '\n');
}

export function leerLogs() {
  if (!fs.existsSync(archivoLogs)) {
    return [];
  }

  const texto = fs.readFileSync(archivoLogs, 'utf-8');
  const lineas = texto.split('\n').filter((l) => l.trim() !== '');

  return lineas.slice(-20);
}
