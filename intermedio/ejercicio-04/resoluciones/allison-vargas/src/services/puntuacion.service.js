const PUNTOS_POR_ELIMINACION = 10;

const BONOS_POSICION = [
  { hasta: 1, puntos: 100 },
  { hasta: 5, puntos: 50 },
  { hasta: 10, puntos: 25 },
];

const LIGAS = [
  { minimo: 3000, nombre: 'campeon' },
  { minimo: 1500, nombre: 'oro' },
  { minimo: 500, nombre: 'plata' },
  { minimo: 0, nombre: 'bronce' },
];

export function calcularPuntos({ posicion, eliminaciones }) {
  const bono = BONOS_POSICION.find((b) => posicion <= b.hasta)?.puntos ?? 0;
  return eliminaciones * PUNTOS_POR_ELIMINACION + bono;
}

export const obtenerLiga = (puntos) => LIGAS.find((liga) => puntos >= liga.minimo).nombre;
