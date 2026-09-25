import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// En ES Modules no existe __dirname por defecto, hay que reconstruirlo
// a partir de import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_EQUIPOS = path.join(__dirname, '..', 'data', 'equipos.json');

export async function listarEquipos() {
  const contenido = await readFile(RUTA_EQUIPOS, 'utf-8');
  return JSON.parse(contenido);
}

export async function obtenerResumenEquipos() {
  const equipos = await listarEquipos();

  const equiposPorModalidad = equipos.reduce((acumulado, equipo) => {
    acumulado[equipo.modalidad] = (acumulado[equipo.modalidad] || 0) + 1;
    return acumulado;
  }, {});

  return {
    total_equipos: equipos.length,
    equipos_por_modalidad: equiposPorModalidad,
  };
}
