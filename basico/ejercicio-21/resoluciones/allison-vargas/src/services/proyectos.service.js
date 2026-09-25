import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_PROYECTOS = path.join(__dirname, '..', 'data', 'proyectos.json');

let proyectos = null;
let siguienteId = null;

async function cargarProyectos() {
  if (proyectos === null) {
    const contenido = await readFile(RUTA_PROYECTOS, 'utf-8');
    proyectos = JSON.parse(contenido);
    siguienteId = proyectos.length > 0 ? Math.max(...proyectos.map((p) => p.id)) + 1 : 1;
  }

  return proyectos;
}

export async function listarProyectos() {
  return cargarProyectos();
}

export async function buscarProyectoPorId(id) {
  const lista = await cargarProyectos();
  return lista.find((proyecto) => proyecto.id === Number(id)) || null;
}

export async function crearProyecto({ nombre, software, duracion_seg, estado }) {
  const lista = await cargarProyectos();

  const nuevoProyecto = { id: siguienteId, nombre, software, duracion_seg, estado };
  siguienteId += 1;
  lista.push(nuevoProyecto);

  return nuevoProyecto;
}

export async function actualizarProyecto(id, { nombre, software, duracion_seg, estado }) {
  const lista = await cargarProyectos();
  const indice = lista.findIndex((proyecto) => proyecto.id === Number(id));

  if (indice === -1) {
    return null;
  }

  lista[indice] = { id: Number(id), nombre, software, duracion_seg, estado };
  return lista[indice];
}

export async function eliminarProyecto(id) {
  const lista = await cargarProyectos();
  const indice = lista.findIndex((proyecto) => proyecto.id === Number(id));

  if (indice === -1) {
    return false;
  }

  lista.splice(indice, 1);
  return true;
}
