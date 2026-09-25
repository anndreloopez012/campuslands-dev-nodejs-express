// los libros creados solo viven en memoria mientras el servidor
// esta corriendo, para mantener el foco en la validacion y no repetir
// la logica de escritura a archivo.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_LIBROS = path.join(__dirname, '..', 'data', 'libros.json');

let libros = null;

async function cargarLibros() {
  if (libros === null) {
    const contenido = await readFile(RUTA_LIBROS, 'utf-8');
    libros = JSON.parse(contenido);
  }

  return libros;
}

export async function listarLibros() {
  return cargarLibros();
}

export async function crearLibro({ titulo, autor, anio_publicacion, paginas }) {
  const listaLibros = await cargarLibros();

  const siguienteId =
    listaLibros.length > 0 ? Math.max(...listaLibros.map((l) => l.id)) + 1 : 1;

  const nuevoLibro = {
    id: siguienteId,
    titulo,
    autor,
    anio_publicacion,
    paginas: paginas ?? null,
  };

  listaLibros.push(nuevoLibro);

  return nuevoLibro;
}
