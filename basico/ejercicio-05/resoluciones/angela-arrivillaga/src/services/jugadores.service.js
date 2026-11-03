import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutaArchivo = path.join(__dirname, '..', 'data', 'jugadores.txt');

export function leerTexto() {
  return fs.readFileSync(rutaArchivo, 'utf-8');
}

export function leerJugadores() {
  const texto = leerTexto();
  const lineas = texto.split('\n');
  const jugadores = [];

  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i].trim() === '') {
      continue;
    }

    const partes = lineas[i].split(',');
    jugadores.push({
      nombre: partes[0],
      posicion: partes[1],
      goles: Number(partes[2])
    });
  }

  return jugadores;
}
