import { loadJson } from '../utils/loadJson.js';
import { AppError } from '../utils/AppError.js';

const jugadores = loadJson('jugadores.json');

export const listar = (rango) => (rango ? jugadores.filter((j) => j.rango === rango) : jugadores);

export const obtener = (id) => {
  const jugador = jugadores.find((j) => j.id === id);
  if (!jugador) throw new AppError('El jugador no existe', 404);
  return jugador;
};

export const existe = (id) => jugadores.some((j) => j.id === id);

export const crear = ({ nick, rango }) => {
  if (jugadores.some((j) => j.nick.toLowerCase() === nick.toLowerCase())) {
    throw new AppError('Ya existe un jugador con ese nick', 409);
  }
  const jugador = { id: Math.max(0, ...jugadores.map((j) => j.id)) + 1, nick, rango, puntos: 0 };
  jugadores.push(jugador);
  return jugador;
};
