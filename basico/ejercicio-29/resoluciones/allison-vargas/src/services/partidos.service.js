import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PARTIDOS = path.join(__dirname, '..', 'data', 'partidos.json');

async function leerPartidos() {
  const contenido = await readFile(RUTA_PARTIDOS, 'utf-8');
  return JSON.parse(contenido);
}

async function guardarPartidos(partidos) {
  await writeFile(RUTA_PARTIDOS, JSON.stringify(partidos, null, 2), 'utf-8');
}

export async function listarPartidos() {
  return leerPartidos();
}

export async function buscarPartidoPorId(id) {
  const partidos = await leerPartidos();
  return partidos.find((partido) => partido.id === Number(id)) || null;
}

export async function crearPartido({ equipo_local, equipo_visitante, modalidad, estado }) {
  const partidos = await leerPartidos();
  const siguienteId = partidos.length > 0 ? Math.max(...partidos.map((p) => p.id)) + 1 : 1;

  const nuevoPartido = {
    id: siguienteId,
    equipo_local,
    equipo_visitante,
    modalidad,
    estado,
    marcador_local: null,
    marcador_visitante: null,
  };

  partidos.push(nuevoPartido);
  await guardarPartidos(partidos);

  return nuevoPartido;
}
