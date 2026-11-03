import { loadJson } from '../utils/loadJson.js';
import { AppError } from '../utils/AppError.js';

const armas = loadJson('armas.json');

export const listar = (tipo) => (tipo ? armas.filter((a) => a.tipo === tipo) : armas);

export const obtener = (id) => {
  const arma = armas.find((a) => a.id === id);
  if (!arma) throw new AppError('El arma no existe', 404);
  return arma;
};
