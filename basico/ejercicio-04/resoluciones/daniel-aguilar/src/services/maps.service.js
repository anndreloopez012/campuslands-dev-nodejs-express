// Exports con nombre: se importan con llaves { }
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// En ES Modules no existen __dirname ni __filename: se reconstruyen con import.meta.url
const dataFile = fileURLToPath(new URL('../data/maps.json', import.meta.url));

export async function listMaps() {
  const content = await readFile(dataFile, 'utf-8');
  return JSON.parse(content);
}

export async function getMapById(id) {
  const maps = await listMaps();
  return maps.find((map) => map.id === id) ?? null;
}
