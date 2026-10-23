import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_JUGADORES = path.join(__dirname, '..', 'data', 'jugadores.json');
const RUTA_COLAS = path.join(__dirname, '..', 'data', 'colas.json');

const NIVEL_RANGO = { bronce: 1, plata: 2, oro: 3, platino: 4, diamante: 5 };

async function leerJugadores() {
  const contenido = await readFile(RUTA_JUGADORES, 'utf-8');
  return JSON.parse(contenido);
}

async function guardarJugadores(jugadores) {
  await writeFile(RUTA_JUGADORES, JSON.stringify(jugadores, null, 2), 'utf-8');
}

async function leerColas() {
  const contenido = await readFile(RUTA_COLAS, 'utf-8');
  return JSON.parse(contenido);
}

export async function listarJugadores() {
  return leerJugadores();
}

export async function buscarJugadorPorId(id) {
  const jugadores = await leerJugadores();
  return jugadores.find((jugador) => jugador.id === Number(id)) || null;
}

export async function listarColas() {
  return leerColas();
}

export async function buscarColaPorId(id) {
  const colas = await leerColas();
  return colas.find((cola) => cola.id === Number(id)) || null;
}

export function nivelDeRango(rango) {
  return NIVEL_RANGO[rango] ?? 0;
}

export async function crearJugador({ nombre, rango }) {
  const jugadores = await leerJugadores();
  const siguienteId = jugadores.length > 0 ? Math.max(...jugadores.map((j) => j.id)) + 1 : 1;

  const nuevoJugador = { id: siguienteId, nombre, rango };
  jugadores.push(nuevoJugador);
  await guardarJugadores(jugadores);

  return nuevoJugador;
}
