import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data');

export const loadJson = (name) => JSON.parse(readFileSync(path.join(dataDir, name), 'utf-8'));
