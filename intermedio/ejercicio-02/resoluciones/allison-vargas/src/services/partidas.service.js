import { existe } from './jugadores.service.js';
import { AppError } from '../utils/AppError.js';

const partidas = [];

export const listar = () => partidas;

export const crear = ({ mapa, jugadores }) => {
  const inexistentes = jugadores.filter((id) => !existe(id));
  if (inexistentes.length) {
    throw new AppError(`Jugadores inexistentes: ${inexistentes.join(', ')}`, 404);
  }
  const partida = { id: partidas.length + 1, mapa, jugadores, estado: 'en curso' };
  partidas.push(partida);
  return partida;
};
