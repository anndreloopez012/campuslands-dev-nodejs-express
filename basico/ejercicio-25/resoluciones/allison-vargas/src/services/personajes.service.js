import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PERSONAJES = path.join(__dirname, '..', 'data', 'personajes.json');
const RUTA_ARMAS = path.join(__dirname, '..', 'data', 'armas.json');

async function leerPersonajes() {
  const contenido = await readFile(RUTA_PERSONAJES, 'utf-8');
  return JSON.parse(contenido);
}

async function guardarPersonajes(personajes) {
  await writeFile(RUTA_PERSONAJES, JSON.stringify(personajes, null, 2), 'utf-8');
}

async function leerArmas() {
  const contenido = await readFile(RUTA_ARMAS, 'utf-8');
  return JSON.parse(contenido);
}

export async function listarPersonajes() {
  return leerPersonajes();
}

export async function buscarPersonajePorId(id) {
  const personajes = await leerPersonajes();
  return personajes.find((personaje) => personaje.id === Number(id)) || null;
}

export async function existeNombre(nombre) {
  const personajes = await leerPersonajes();
  return personajes.some((personaje) => personaje.nombre.toLowerCase() === nombre.toLowerCase());
}

export async function crearPersonaje({ nombre, nivel, clase }) {
  const personajes = await leerPersonajes();
  const siguienteId = personajes.length > 0 ? Math.max(...personajes.map((p) => p.id)) + 1 : 1;

  const nuevoPersonaje = { id: siguienteId, nombre, nivel, clase };
  personajes.push(nuevoPersonaje);
  await guardarPersonajes(personajes);

  return nuevoPersonaje;
}

export async function actualizarPersonaje(id, { nombre, nivel, clase }) {
  const personajes = await leerPersonajes();
  const indice = personajes.findIndex((personaje) => personaje.id === Number(id));

  if (indice === -1) {
    return null;
  }

  personajes[indice] = { id: Number(id), nombre, nivel, clase };
  await guardarPersonajes(personajes);

  return personajes[indice];
}

export async function eliminarPersonaje(id) {
  const personajes = await leerPersonajes();
  const indice = personajes.findIndex((personaje) => personaje.id === Number(id));

  if (indice === -1) {
    return false;
  }

  personajes.splice(indice, 1);
  await guardarPersonajes(personajes);

  return true;
}

export async function buscarArmaPorId(armaId) {
  const armas = await leerArmas();
  return armas.find((arma) => arma.id === Number(armaId)) || null;
}
