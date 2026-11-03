import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logInfo, logError } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PARTIDAS = path.join(__dirname, '..', 'data', 'partidas.json');

async function leerPartidas() {
  const contenido = await readFile(RUTA_PARTIDAS, 'utf-8');
  return JSON.parse(contenido);
}

async function guardarPartidas(partidas) {
  await writeFile(RUTA_PARTIDAS, JSON.stringify(partidas, null, 2), 'utf-8');
}

export async function listarPartidas() {
  return leerPartidas();
}

// Ademas del log automatico de
// cada peticion HTTP (middleware), el servicio registra un log de
// NEGOCIO cuando pasa algo relevante (se creo una partida, o algo
// fallo), con su propio mensaje descriptivo.
export async function crearPartida({ equipo_a, equipo_b, duracion_min, resultado }) {
  try {
    const partidas = await leerPartidas();
    const siguienteId = partidas.length > 0 ? Math.max(...partidas.map((p) => p.id)) + 1 : 1;

    const nuevaPartida = { id: siguienteId, equipo_a, equipo_b, duracion_min, resultado };
    partidas.push(nuevaPartida);
    await guardarPartidas(partidas);

    logInfo(`Partida registrada: id=${nuevaPartida.id} ${equipo_a} vs ${equipo_b}`);

    return nuevaPartida;
  } catch (error) {
    logError(`Error registrando partida: ${error.message}`);
    throw error;
  }
}
