import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError } from '../utils/AppError.js';
import { requerirMotoPorId } from './motos.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_ORDENES = path.join(__dirname, '..', 'data', 'ordenes.json');

async function leerOrdenes() {
  const contenido = await readFile(RUTA_ORDENES, 'utf-8');
  return JSON.parse(contenido);
}

async function guardarOrdenes(ordenes) {
  await writeFile(RUTA_ORDENES, JSON.stringify(ordenes, null, 2), 'utf-8');
}

export async function listarOrdenes() {
  return leerOrdenes();
}

export async function listarOrdenesDeMoto(motoId) {
  await requerirMotoPorId(motoId);

  const ordenes = await leerOrdenes();
  return ordenes.filter((orden) => orden.motoId === Number(motoId));
}

export async function buscarOrdenPorId(id) {
  const ordenes = await leerOrdenes();
  return ordenes.find((orden) => orden.id === Number(id)) || null;
}

export async function crearOrdenParaMoto(motoId, { descripcion, estado, costo_estimado }) {
  await requerirMotoPorId(motoId);

  const ordenes = await leerOrdenes();
  const siguienteId = ordenes.length > 0 ? Math.max(...ordenes.map((o) => o.id)) + 1 : 1;

  const nuevaOrden = {
    id: siguienteId,
    motoId: Number(motoId),
    descripcion,
    estado,
    costo_estimado,
  };

  ordenes.push(nuevaOrden);
  await guardarOrdenes(ordenes);

  return nuevaOrden;
}

export async function actualizarEstadoOrden(id, estado) {
  const ordenes = await leerOrdenes();
  const indice = ordenes.findIndex((orden) => orden.id === Number(id));

  if (indice === -1) {
    return null;
  }

  ordenes[indice] = { ...ordenes[indice], estado };
  await guardarOrdenes(ordenes);

  return ordenes[indice];
}
