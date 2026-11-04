import { loadJson } from '../utils/loadJson.js';
import { AppError } from '../utils/AppError.js';
import * as motosService from './motos.service.js';

const ordenes = loadJson('ordenes.json');

const TRANSICIONES = {
  pendiente: ['en proceso', 'cancelada'],
  'en proceso': ['terminada', 'cancelada'],
  terminada: [],
  cancelada: [],
};

export function obtener(id) {
  const orden = ordenes.find((o) => o.id === id);
  if (!orden) throw new AppError('La orden no existe', 404);
  return orden;
}

export const listar = ({ estado, motoId } = {}) =>
  ordenes.filter((o) => (!estado || o.estado === estado) && (!motoId || o.motoId === motoId));

export const motoTieneOrdenes = (motoId) => ordenes.some((o) => o.motoId === motoId);

export function crear(datos) {
  const moto = motosService.obtener(datos.motoId);
  if (moto.estado === 'vendida') {
    throw new AppError('No se puede crear una orden para una moto vendida', 409);
  }
  const orden = { id: Math.max(0, ...ordenes.map((o) => o.id)) + 1, ...datos, estado: 'pendiente' };
  ordenes.push(orden);
  return orden;
}

export function cambiarEstado(id, { estado }) {
  const orden = obtener(id);
  if (!TRANSICIONES[orden.estado].includes(estado)) {
    throw new AppError(`No se puede pasar de ${orden.estado} a ${estado}`, 409);
  }
  orden.estado = estado;
  return orden;
}
