import { loadJson } from '../utils/loadJson.js';
import { NotFoundError } from '../utils/errors.js';
import { buscar, sugerir } from './busqueda.service.js';
import { busquedaCanciones } from '../validators/busqueda/canciones.busqueda.js';

const canciones = loadJson('canciones.json');

const candidatos = [];
const vistos = new Set();
const tipos = [['titulo', 'cancion', 0], ['artista', 'artista', 1], ['album', 'album', 2]];
for (const cancion of canciones) {
  for (const [campo, tipo, orden] of tipos) {
    const clave = `${tipo}:${cancion[campo]}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    candidatos.push({ texto: cancion[campo], tipo, orden });
  }
}

export const listar = (query) => buscar(canciones, query, busquedaCanciones);

export const sugerencias = (query) => sugerir(candidatos, query);

export const listarTodas = () => canciones;

export function obtener(id) {
  const cancion = canciones.find((item) => item.id === id);
  if (!cancion) throw new NotFoundError(`No existe la cancion ${id}`, 'CANCION_NO_ENCONTRADA');
  return cancion;
}
