// Base de datos simulada en memoria con temática de películas de miedo
const horrorMoviesDB = [
  {
    id: 1,
    title: "The Shining",
    director: "Stanley Kubrick",
    year: 1980,
    subgenre: "Terror Psicológico",
    rating: 8.4,
    synopsis: "Una familia se traslada a un hotel aislado para el invierno, donde una presencia siniestra influye en el padre."
  },
  {
    id: 2,
    title: "Halloween",
    director: "John Carpenter",
    year: 1978,
    subgenre: "Slasher",
    rating: 7.7,
    synopsis: "Quince años después de asesinar a su hermana, Michael Myers escapa de un hospital psiquiátrico para regresar a Haddonfield."
  },
  {
    id: 3,
    title: "Hereditary",
    director: "Ari Aster",
    year: 2018,
    subgenre: "Terror Sobrenatural",
    rating: 7.3,
    synopsis: "Tras la muerte de la matriarca, una familia comienza a desentrañar oscuros secretos sobre su ascendencia."
  },
  {
    id: 4,
    title: "A Nightmare on Elm Street",
    director: "Wes Craven",
    year: 1984,
    subgenre: "Slasher",
    rating: 7.4,
    synopsis: "Un asesino deformado persigue y mata a adolescentes en sus sueños, provocando su muerte en la realidad."
  },
  {
    id: 5,
    title: "The Exorcist",
    director: "William Friedkin",
    year: 1973,
    subgenre: "Terror Demoníaco",
    rating: 8.1,
    synopsis: "Dos sacerdotes intentan salvar a una niña de doce años que ha sido poseída por una entidad misteriosa."
  },
  {
    id: 6,
    title: "Scream",
    director: "Wes Craven",
    year: 1996,
    subgenre: "Slasher",
    rating: 7.4,
    synopsis: "Un misterioso asesino enmascarado conocido como Ghostface aterroriza a un grupo de adolescentes de preparatoria."
  },
  {
    id: 7,
    title: "The Conjuring",
    director: "James Wan",
    year: 2013,
    subgenre: "Terror Sobrenatural",
    rating: 7.5,
    synopsis: "Los investigadores paranormales Ed y Lorraine Warren ayudan a una familia aterrorizada por una presencia oscura en su granja."
  }
];

// Helper para simular retardo asíncrono (I/O, DB, red)
const simulateDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene todas las películas con filtros opcionales de subgénero y calificación mínima.
 */
export async function getAllMovies({ subgenre, minRating } = {}) {
  await simulateDelay(150);

  let results = [...horrorMoviesDB];

  if (subgenre) {
    const term = subgenre.toLowerCase();
    results = results.filter(movie => movie.subgenre.toLowerCase().includes(term));
  }

  if (minRating !== undefined && minRating !== null) {
    const ratingNum = Number(minRating);
    if (!isNaN(ratingNum)) {
      results = results.filter(movie => movie.rating >= ratingNum);
    }
  }

  return results;
}

/**
 * Obtiene una película por su ID único.
 */
export async function getMovieById(id) {
  await simulateDelay(100);
  const movie = horrorMoviesDB.find(m => m.id === id);
  return movie || null;
}

/**
 * Busca películas cuyo título contenga la palabra clave.
 */
export async function searchMoviesByTitle(query) {
  await simulateDelay(150);
  const term = query.toLowerCase().trim();
  return horrorMoviesDB.filter(m => m.title.toLowerCase().includes(term));
}

/**
 * Registra una nueva película de terror en el catálogo.
 */
export async function createMovie(movieData) {
  await simulateDelay(200);

  // Comprobar que no exista duplicado por título
  const exists = horrorMoviesDB.some(
    m => m.title.toLowerCase() === movieData.title.trim().toLowerCase()
  );

  if (exists) {
    const error = new Error(`Ya existe una película registrada con el título '${movieData.title}'.`);
    error.statusCode = 409;
    throw error;
  }

  const nextId = horrorMoviesDB.length > 0 
    ? Math.max(...horrorMoviesDB.map(m => m.id)) + 1 
    : 1;

  const newMovie = {
    id: nextId,
    title: movieData.title.trim(),
    director: movieData.director.trim(),
    year: Number(movieData.year),
    subgenre: movieData.subgenre.trim(),
    rating: Number(movieData.rating),
    synopsis: movieData.synopsis ? movieData.synopsis.trim() : "Sin sinopsis disponible."
  };

  horrorMoviesDB.push(newMovie);
  return newMovie;
}

/**
 * Selecciona una película de terror aleatoria para susto sorpresa.
 */
export async function getRandomMovie() {
  await simulateDelay(120);
  if (horrorMoviesDB.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * horrorMoviesDB.length);
  return horrorMoviesDB[randomIndex];
}
