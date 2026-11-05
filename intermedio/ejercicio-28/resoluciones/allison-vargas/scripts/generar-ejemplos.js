import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generarArchivos } from '../src/ejemplos/archivos.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

for (const [ruta, contenido] of Object.entries(generarArchivos())) {
  const destino = resolve(raiz, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido);
  console.log(`generado ${ruta}`);
}
