import { loadJson } from '../utils/loadJson.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const hiperdeportivos = loadJson('hiperdeportivos.json');

export function listar({ marca, minPotencia } = {}) {
  return hiperdeportivos.filter(
    (h) =>
      (!marca || h.marca.toLowerCase() === marca.toLowerCase()) &&
      (!minPotencia || h.potenciaCv >= Number(minPotencia))
  );
}

export function obtener(id) {
  const auto = hiperdeportivos.find((h) => h.id === id);
  if (!auto) throw new NotFoundError('El hiperdeportivo no existe', 'HIPERDEPORTIVO_NO_ENCONTRADO');
  return auto;
}

export function crear(datos) {
  const duplicado = hiperdeportivos.some(
    (h) => h.marca.toLowerCase() === datos.marca.toLowerCase() && h.modelo.toLowerCase() === datos.modelo.toLowerCase()
  );
  if (duplicado) throw new ConflictError('Ya existe un hiperdeportivo con esa marca y modelo', 'HIPERDEPORTIVO_DUPLICADO');

  const auto = { id: Math.max(0, ...hiperdeportivos.map((h) => h.id)) + 1, ...datos };
  hiperdeportivos.push(auto);
  logger.info(`Hiperdeportivo creado: ${auto.marca} ${auto.modelo}`);
  return auto;
}
