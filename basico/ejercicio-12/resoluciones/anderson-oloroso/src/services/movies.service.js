const MOVIES = [
  { id: 1, title: "El Exorcista", year: 1973, director: "William Friedkin" },
  { id: 2, title: "El Resplandor", year: 1980, director: "Stanley Kubrick" },
  { id: 3, title: "Psicosis", year: 1960, director: "Alfred Hitchcock" },
  { id: 4, title: "It", year: 2017, director: "Andy Muschietti" },
  { id: 5, title: "Hereditary", year: 2018, director: "Ari Aster" },
  { id: 6, title: "La Masacre de Texas", year: 1974, director: "Tobe Hooper" },
];

const RATINGS = [
  { movieId: 1, score: 8.1, reviews: 420 },
  { movieId: 2, score: 8.4, reviews: 510 },
  { movieId: 3, score: 8.5, reviews: 380 },
  { movieId: 4, score: 7.3, reviews: 290 },
  { movieId: 5, score: 7.3, reviews: 210 },
  { movieId: 6, score: 7.5, reviews: 175 },
];

/**
 * Busca una película por título (simulando delay async).
 * @param {string} title
 * @returns {Promise<Object>}
 */
export function fetchMovie(title) {
  return new Promise((resolve, reject) => {
    if (!title || typeof title !== "string" || title.trim() === "") {
      reject(new Error("El título de la película es obligatorio."));
      return;
    }

    setTimeout(() => {
      const movie = MOVIES.find(
        (m) => m.title.toLowerCase().includes(title.trim().toLowerCase())
      );

      if (!movie) {
        reject(new Error(`Película "${title}" no encontrada.`));
        return;
      }

      resolve(movie);
    }, 800);
  });
}

/**
 * Obtiene el rating de una película por su ID (simulando delay async).
 * @param {number} movieId
 * @returns {Promise<Object>}
 */
export function fetchRating(movieId) {
  return new Promise((resolve, reject) => {
    if (!movieId || typeof movieId !== "number") {
      reject(new Error("El ID de la película debe ser un número."));
      return;
    }

    setTimeout(() => {
      const rating = RATINGS.find((r) => r.movieId === movieId);

      if (!rating) {
        reject(new Error(`Rating no encontrado para la película con ID ${movieId}.`));
        return;
      }

      resolve(rating);
    }, 600);
  });
}
