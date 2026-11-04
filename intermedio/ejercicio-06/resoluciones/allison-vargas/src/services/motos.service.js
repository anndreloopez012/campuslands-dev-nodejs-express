import { loadJson } from '../utils/loadJson.js';
import { AppError } from '../utils/AppError.js';

const motos = loadJson('motos.json');

export function obtener(id) {
  const moto = motos.find((m) => m.id === id);
  if (!moto) throw new AppError('La moto no existe', 404);
  return moto;
}

export function listar({ marca, estado, anioDesde } = {}) {
  return motos.filter(
    (m) =>
      (!marca || m.marca.toLowerCase() === marca.toLowerCase()) &&
      (!estado || m.estado === estado) &&
      (!anioDesde || m.anio >= anioDesde)
  );
}

function verificarPlacaLibre(placa, idActual) {
  if (motos.some((m) => m.placa === placa && m.id !== idActual)) {
    throw new AppError('Ya existe una moto con esa placa', 409);
  }
}

export function crear(datos) {
  verificarPlacaLibre(datos.placa);
  const moto = { id: Math.max(0, ...motos.map((m) => m.id)) + 1, ...datos };
  motos.push(moto);
  return moto;
}

export function actualizar(id, datos) {
  const moto = obtener(id);
  verificarPlacaLibre(datos.placa, id);
  return Object.assign(moto, datos);
}

export function eliminar(id, tieneOrdenes) {
  const moto = obtener(id);
  if (tieneOrdenes) throw new AppError('No se puede eliminar una moto con ordenes de servicio', 409);
  motos.splice(motos.indexOf(moto), 1);
}
