const players = [
  { id: 1, ranking: 1, nombre: 'Wang Chuqin', pais: 'China', empunadura: 'Clásica', mano: 'Izquierda', puntosElo: 7925, victorias: 142, derrotas: 18 },
  { id: 2, ranking: 2, nombre: 'Fan Zhendong', pais: 'China', empunadura: 'Clásica', mano: 'Derecha', puntosElo: 7450, victorias: 185, derrotas: 24 },
  { id: 3, ranking: 3, nombre: 'Felix Lebrun', pais: 'Francia', empunadura: 'Lapicero', mano: 'Derecha', puntosElo: 6010, victorias: 88, derrotas: 21 },
  { id: 4, ranking: 4, nombre: 'Hugo Calderano', pais: 'Brasil', empunadura: 'Clásica', mano: 'Derecha', puntosElo: 5890, victorias: 110, derrotas: 35 },
  { id: 5, ranking: 5, nombre: 'Tomokazu Harimoto', pais: 'Japón', empunadura: 'Clásica', mano: 'Derecha', puntosElo: 5650, victorias: 130, derrotas: 40 },
  { id: 6, ranking: 6, nombre: 'Lin Shidong', pais: 'China', empunadura: 'Clásica', mano: 'Derecha', puntosElo: 5400, victorias: 75, derrotas: 15 }
];

export const ALLOWED_SORT_FIELDS = ['ranking', 'puntosElo', 'victorias', 'derrotas', 'nombre', 'pais'];

export const getSortedPlayers = ({ sortBy = 'ranking', order = 'asc' }) => {
  const normalizedSortBy = sortBy.trim();
  const normalizedOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';

  if (!ALLOWED_SORT_FIELDS.includes(normalizedSortBy)) {
    const error = new Error(
      `Campo de ordenamiento '${sortBy}' no permitido. Campos válidos: ${ALLOWED_SORT_FIELDS.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }

  const sorted = [...players].sort((a, b) => {
    const valA = a[normalizedSortBy];
    const valB = b[normalizedSortBy];

    let comparison = 0;
    if (typeof valA === 'string' && typeof valB === 'string') {
      comparison = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
    } else {
      comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
    }

    return normalizedOrder === 'desc' ? -comparison : comparison;
  });

  return {
    ordenamiento: {
      campo: normalizedSortBy,
      direccion: normalizedOrder,
      camposPermitidos: ALLOWED_SORT_FIELDS
    },
    total: sorted.length,
    data: sorted
  };
};
