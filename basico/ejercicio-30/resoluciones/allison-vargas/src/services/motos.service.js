import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError } from '../utils/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_MOTOS = path.join(__dirname, '..', 'data', 'motos.json');

async function leerMotos() {
  const contenido = await readFile(RUTA_MOTOS, 'utf-8');
  return JSON.parse(contenido);
}

async function guardarMotos(motos) {
  await writeFile(RUTA_MOTOS, JSON.stringify(motos, null, 2), 'utf-8');
}

export async function listarMotos() {
  return leerMotos();
}

export async function buscarMotoPorId(id) {
  const motos = await leerMotos();
  return motos.find((moto) => moto.id === Number(id)) || null;
}

// Usada por el servicio de ordenes para confirmar que la moto existe
// antes de crear una orden asociada.
export async function requerirMotoPorId(id) {
  const moto = await buscarMotoPorId(id);

  if (!moto) {
    throw new AppError(`No existe una moto con id ${id}`, 404);
  }

  return moto;
}

export async function crearMoto({ placa, marca, modelo, propietario }) {
  const motos = await leerMotos();
  const siguienteId = motos.length > 0 ? Math.max(...motos.map((m) => m.id)) + 1 : 1;

  const nuevaMoto = { id: siguienteId, placa, marca, modelo, propietario };
  motos.push(nuevaMoto);
  await guardarMotos(motos);

  return nuevaMoto;
}

export async function actualizarMoto(id, { placa, marca, modelo, propietario }) {
  const motos = await leerMotos();
  const indice = motos.findIndex((moto) => moto.id === Number(id));

  if (indice === -1) {
    return null;
  }

  motos[indice] = { id: Number(id), placa, marca, modelo, propietario };
  await guardarMotos(motos);

  return motos[indice];
}

export async function eliminarMoto(id) {
  const motos = await leerMotos();
  const indice = motos.findIndex((moto) => moto.id === Number(id));

  if (indice === -1) {
    return false;
  }

  motos.splice(indice, 1);
  await guardarMotos(motos);

  return true;
}
