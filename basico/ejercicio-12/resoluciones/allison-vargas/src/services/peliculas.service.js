import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PELICULAS = path.join(__dirname, '..', 'data', 'peliculas.json');

export async function listarPeliculas() {
  const contenido = await readFile(RUTA_PELICULAS, 'utf-8');
  return JSON.parse(contenido);
}

export async function buscarPeliculaPorId(id) {
  const peliculas = await listarPeliculas();
  const pelicula = peliculas.find((p) => p.id === Number(id));

  if (!pelicula) {
    const error = new Error(`No existe una pelicula con id ${id}`);
    error.code = 'PELICULA_NO_ENCONTRADA';
    throw error;
  }

  return pelicula;
}

// Esta no necesita ser async: no espera nada, solo valida. Se puede
// llamar con o sin "await" desde afuera, ambas funcionan igual.
export function verificarEdadPermitida(pelicula, edad) {
  if (edad < pelicula.edad_minima) {
    const error = new Error(
      `"${pelicula.titulo}" requiere una edad minima de ${pelicula.edad_minima} anios`
    );
    error.code = 'EDAD_INSUFICIENTE';
    throw error;
  }
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reproducirPelicula(pelicula) {
  await esperar(50); // simula el tiempo de "cargar" el video

  return {
    reproduciendo: true,
    titulo: pelicula.titulo,
    duracion_min: pelicula.duracion_min,
  };
}
