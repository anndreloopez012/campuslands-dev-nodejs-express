// En el disco cuando se crea un peleador nuevo, para que el dato
// persista aunque se reinicie el servidor. Es una persistencia simple,
// sin base de datos real, pero sigue el mismo principio: leer, modificar
// en memoria, y guardar.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PELEADORES = path.join(__dirname, '..', 'data', 'peleadores.json');

export async function listarPeleadores() {
  const contenido = await readFile(RUTA_PELEADORES, 'utf-8');
  return JSON.parse(contenido);
}

export async function crearPeleador({ nombre, categoria_peso }) {
  const peleadores = await listarPeleadores();

  const siguienteId =
    peleadores.length > 0 ? Math.max(...peleadores.map((p) => p.id)) + 1 : 1;

  const nuevoPeleador = {
    id: siguienteId,
    nombre,
    categoria_peso,
    record: '0-0-0',
  };

  peleadores.push(nuevoPeleador);

  // El paso que hace la diferencia con solo "leer": guardar el archivo
  // completo actualizado, con indentacion para que siga siendo legible.
  await writeFile(RUTA_PELEADORES, JSON.stringify(peleadores, null, 2), 'utf-8');

  return nuevoPeleador;
} 