export const AHORA = new Date('2026-11-04T12:00:00.000Z');

export const PUNTOS = [
  { x: 50, y: 50 },
  { x: 55, y: 50 },
  { x: 60, y: 50 },
  { x: 90, y: 90 },
];

export const aparicionFija = (cantidad) => PUNTOS.slice(0, cantidad);

export const LOOT_FIJO = [
  { id: 1, tipo: 'pistola', x: 50, y: 50 },
  { id: 2, tipo: 'rifle', x: 51, y: 50 },
  { id: 3, tipo: 'botiquin', x: 50, y: 51 },
  { id: 4, tipo: 'botiquin', x: 49, y: 50 },
  { id: 5, tipo: 'escudo', x: 50, y: 49 },
  { id: 6, tipo: 'municion', x: 51, y: 51 },
  { id: 7, tipo: 'botiquin', x: 52, y: 50 },
  { id: 8, tipo: 'botiquin', x: 48, y: 50 },
  { id: 9, tipo: 'pistola', x: 90, y: 90 },
];

export const jugador = (id, extra = {}) => ({ id, nick: `jugador${id}`, suspendido: false, ...extra });
