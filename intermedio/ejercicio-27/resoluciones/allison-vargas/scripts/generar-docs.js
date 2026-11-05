import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generarArchivos } from '../src/docs/archivos.js';

const carpeta = path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs');
mkdirSync(carpeta, { recursive: true });

for (const [nombre, contenido] of Object.entries(generarArchivos())) {
  writeFileSync(path.join(carpeta, nombre), contenido);
  console.log(`docs/${nombre}`);
}
