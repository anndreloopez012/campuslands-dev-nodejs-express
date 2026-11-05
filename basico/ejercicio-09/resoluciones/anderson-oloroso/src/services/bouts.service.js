import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/bouts.json');

export function loadBouts() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error('El archivo bouts.json contiene un formato JSON corrupto.');
  }
}

export function saveBout(newBoutData) {
  const bouts = loadBouts();
  const id = bouts.length > 0 ? Math.max(...bouts.map((b) => b.id)) + 1 : 1;

  const bout = {
    id,
    evento: newBoutData.evento || 'Combate de Exhibición',
    luchadorRojo: newBoutData.luchadorRojo,
    luchadorAzul: newBoutData.luchadorAzul,
    division: newBoutData.division || 'Peso Libre',
    rounds: newBoutData.rounds || 3,
    tituloEnJuego: Boolean(newBoutData.tituloEnJuego),
    ganador: newBoutData.ganador || 'Por Definir',
    metodo: newBoutData.metodo || 'Pendiente'
  };

  bouts.push(bout);
  fs.writeFileSync(DATA_FILE, JSON.stringify(bouts, null, 2), 'utf-8');
  return bout;
}
