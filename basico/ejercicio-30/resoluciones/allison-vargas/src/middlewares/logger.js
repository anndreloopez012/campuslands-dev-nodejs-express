import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_LOGS = path.join(__dirname, '..', '..', 'logs');
const ARCHIVO_LOG = path.join(CARPETA_LOGS, 'access.log');

if (!fs.existsSync(CARPETA_LOGS)) {
  fs.mkdirSync(CARPETA_LOGS, { recursive: true });
}

export function registrarPeticionHTTP(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    const duracionMs = Date.now() - inicio;
    const linea = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracionMs}ms)`;
    console.log(linea);
    fs.appendFileSync(ARCHIVO_LOG, linea + '\n', 'utf-8');
  });

  next();
}
