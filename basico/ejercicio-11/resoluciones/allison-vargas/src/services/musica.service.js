import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_CANCIONES = path.join(__dirname, '..', 'data', 'canciones.json');

function leerCanciones() {
  return new Promise((resolve, reject) => {
    fs.readFile(RUTA_CANCIONES, 'utf-8', (error, contenido) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(JSON.parse(contenido));
    });
  });
}

export function listarCanciones() {
  return leerCanciones();
}

export function buscarCancion(titulo) {
  return leerCanciones().then((canciones) => {
    const cancion = canciones.find(
      (c) => c.titulo.toLowerCase() === titulo.toLowerCase()
    );

    if (!cancion) {
      // Rechazar la promesa a proposito cuando no se encuentra nada,
      // para que quien la use pueda manejarlo con .catch().
      return Promise.reject(new Error(`No se encontro la cancion "${titulo}"`));
    }

    return cancion;
  });
}
