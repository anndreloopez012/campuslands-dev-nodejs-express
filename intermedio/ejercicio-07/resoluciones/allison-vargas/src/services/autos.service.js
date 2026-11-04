import { loadJson } from '../utils/loadJson.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

const autos = loadJson('autos.json');

export const listar = (estado) => (estado ? autos.filter((a) => a.estado === estado) : autos);

export function obtener(id) {
  const auto = autos.find((a) => a.id === id);
  if (!auto) throw new NotFoundError('El auto no existe', 'AUTO_NO_ENCONTRADO');
  return auto;
}

export function crear(datos) {
  const duplicado = autos.some(
    (a) => a.marca.toLowerCase() === datos.marca.toLowerCase() &&
      a.modelo.toLowerCase() === datos.modelo.toLowerCase() &&
      a.anio === datos.anio
  );
  if (duplicado) throw new ConflictError('Ya existe un auto con esa marca, modelo y anio', 'AUTO_DUPLICADO');

  const auto = { id: Math.max(0, ...autos.map((a) => a.id)) + 1, ...datos, estado: 'disponible' };
  autos.push(auto);
  return auto;
}

export function reservar(id, { cliente }) {
  const auto = obtener(id);
  if (auto.estado !== 'disponible') {
    throw new ConflictError(`El auto esta ${auto.estado} y no se puede reservar`, 'AUTO_NO_DISPONIBLE');
  }
  auto.estado = 'reservado';
  auto.cliente = cliente;
  return auto;
}
