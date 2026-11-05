const fighters = [
  { id: 1, nombre: 'Rico Verhoeven', apodo: 'The King of Kickboxing', division: 'Peso Pesado', pais: 'Países Bajos', victorias: 64, derrotas: 10, kos: 20, status: 'Activo' },
  { id: 2, nombre: 'Badr Hari', apodo: 'The Golden Boy', division: 'Peso Pesado', pais: 'Marruecos', victorias: 106, derrotas: 16, kos: 92, status: 'Retirado' },
  { id: 3, nombre: 'Giorgio Petrosyan', apodo: 'The Doctor', division: 'Peso Welter', pais: 'Italia', victorias: 105, derrotas: 3, kos: 42, status: 'Activo' },
  { id: 4, nombre: 'Superbon Singha Mawynn', apodo: 'The Master Kicker', division: 'Peso Welter', pais: 'Tailandia', victorias: 114, derrotas: 36, kos: 28, status: 'Activo' },
  { id: 5, nombre: 'Chingiz Allazov', apodo: 'Chinga', division: 'Peso Ligero', pais: 'Azerbaiyán', victorias: 61, derrotas: 5, kos: 37, status: 'Activo' },
  { id: 6, nombre: 'Takeru Segawa', apodo: 'Natural Born Crusher', division: 'Peso Pluma', pais: 'Japón', victorias: 43, derrotas: 4, kos: 25, status: 'Activo' },
  { id: 7, nombre: 'Tenshin Nasukawa', apodo: 'Ninja Boy', division: 'Peso Pluma', pais: 'Japón', victorias: 44, derrotas: 0, kos: 30, status: 'Retirado' },
  { id: 8, nombre: 'Artem Vakhitov', apodo: 'The Sniper', division: 'Peso Pesado', pais: 'Rusia', victorias: 23, derrotas: 6, kos: 8, status: 'Activo' }
];

export const getPaginatedFighters = ({ page = 1, limit = 3, division, minKos, status }) => {
  let filtered = [...fighters];

  if (division) {
    filtered = filtered.filter(
      (f) => f.division.toLowerCase() === division.trim().toLowerCase()
    );
  }

  if (minKos !== undefined && !isNaN(Number(minKos))) {
    filtered = filtered.filter((f) => f.kos >= Number(minKos));
  }

  if (status) {
    filtered = filtered.filter(
      (f) => f.status.toLowerCase() === status.trim().toLowerCase()
    );
  }

  const totalRecords = filtered.length;
  const numLimit = Math.min(Math.max(1, Number(limit)), 20); // Entre 1 y 20
  const totalPages = Math.ceil(totalRecords / numLimit) || 1;
  const numPage = Math.min(Math.max(1, Number(page)), totalPages);

  const startIndex = (numPage - 1) * numLimit;
  const paginatedData = filtered.slice(startIndex, startIndex + numLimit);

  return {
    pagination: {
      totalRecords,
      page: numPage,
      limit: numLimit,
      totalPages,
      hasNextPage: numPage < totalPages,
      hasPrevPage: numPage > 1
    },
    appliedFilters: {
      division: division || null,
      minKos: minKos ? Number(minKos) : null,
      status: status || null
    },
    data: paginatedData
  };
};
