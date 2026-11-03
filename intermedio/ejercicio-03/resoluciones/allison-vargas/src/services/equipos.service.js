import { loadJson } from '../utils/loadJson.js';
import { AppError } from '../utils/AppError.js';

const MAX_JUGADORES = 5;
const equipos = loadJson('equipos.json');

const mismoNombre = (a, b) => a.toLowerCase() === b.toLowerCase();

export const listar = (region) => (region ? equipos.filter((e) => e.region === region.toUpperCase()) : equipos);

export function obtener(id) {
  const equipo = equipos.find((e) => e.id === id);
  if (!equipo) throw new AppError('El equipo no existe', 404);
  return equipo;
}

function verificarNombreLibre(nombre, idActual) {
  const repetido = equipos.some((e) => e.id !== idActual && mismoNombre(e.nombre, nombre));
  if (repetido) throw new AppError('Ya existe un equipo con ese nombre', 409);
}

export function crear({ nombre, region }) {
  verificarNombreLibre(nombre);
  const equipo = { id: Math.max(0, ...equipos.map((e) => e.id)) + 1, nombre, region, jugadores: [] };
  equipos.push(equipo);
  return equipo;
}

export function actualizar(id, { nombre, region }) {
  const equipo = obtener(id);
  verificarNombreLibre(nombre, id);
  Object.assign(equipo, { nombre, region });
  return equipo;
}

export function eliminar(id) {
  const equipo = obtener(id);
  equipos.splice(equipos.indexOf(equipo), 1);
}

export function agregarJugador(id, { nick }) {
  const equipo = obtener(id);
  if (equipo.jugadores.length >= MAX_JUGADORES) {
    throw new AppError(`El equipo ya tiene ${MAX_JUGADORES} jugadores`, 409);
  }
  if (equipo.jugadores.some((j) => mismoNombre(j, nick))) {
    throw new AppError('El jugador ya esta en el equipo', 409);
  }
  equipo.jugadores.push(nick);
  return equipo;
}
