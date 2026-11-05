let movies = [
  {
    id: 1,
    titulo: 'El Conjuro',
    director: 'James Wan',
    anio: 2013,
    criticas: [
      { id: 1, autor: 'Carlos Critico', calificacion: 9, comentario: 'Una obra maestra del terror contemporáneo.' }
    ]
  },
  {
    id: 2,
    titulo: 'Hereditary',
    director: 'Ari Aster',
    anio: 2018,
    criticas: [
      { id: 1, autor: 'Ana Cine', calificacion: 10, comentario: 'Angustia pura y atmósfera impecable.' }
    ]
  }
];

export const getMovie = (id) => {
  const m = movies.find(m => m.id === Number(id));
  if (!m) {
    const err = new Error(`Película de terror con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  return m;
};

export const getReviews = (movieId) => {
  const movie = getMovie(movieId);
  return movie.criticas;
};

export const addReview = (movieId, { autor, calificacion, comentario }) => {
  const movie = getMovie(movieId);
  const newReview = {
    id: movie.criticas.length > 0 ? Math.max(...movie.criticas.map(r => r.id)) + 1 : 1,
    autor: autor || 'Espectador Anónimo',
    calificacion: Number(calificacion),
    comentario: comentario || ''
  };
  movie.criticas.push(newReview);
  return newReview;
};
