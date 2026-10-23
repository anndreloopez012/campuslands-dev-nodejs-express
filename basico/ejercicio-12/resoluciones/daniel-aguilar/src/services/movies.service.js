const DELAY_MS = 40;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const movies = [
  { id: 1, title: 'La Casa del Eco', year: 2021, directorId: 1 },
  { id: 2, title: 'Noche sin Luna', year: 2018, directorId: 2 },
  { id: 3, title: 'El Ultimo Pasillo', year: 2023, directorId: 1 },
];
const directors = [
  { id: 1, name: 'Elena Ruiz' },
  { id: 2, name: 'Marcos Vela' },
];
const reviews = [
  { movieId: 1, score: 8, comment: 'Atmosfera tensa y buen sonido.' },
  { movieId: 1, score: 7, comment: 'Final predecible.' },
  { movieId: 2, score: 9, comment: 'Susto garantizado.' },
];

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

async function findMovie(id) {
  await delay(DELAY_MS);
  const movie = movies.find((item) => item.id === id);
  if (!movie) throw notFound(`Pelicula con id ${id} no existe`); // throw dentro de async = promesa rechazada
  return { ...movie };
}

async function findDirector(id) {
  await delay(DELAY_MS);
  return directors.find((item) => item.id === id) || null;
}

async function findReviews(movieId) {
  await delay(DELAY_MS);
  return reviews.filter((item) => item.movieId === movieId);
}

// Pasos dependientes: primero la pelicula, luego lo que necesita de ella.
// Los dos ultimos NO dependen entre si, asi que se piden en paralelo con Promise.all.
async function getMovieDetail(id) {
  const movie = await findMovie(id);
  const [director, movieReviews] = await Promise.all([findDirector(movie.directorId), findReviews(id)]);
  const average = movieReviews.length
    ? movieReviews.reduce((sum, review) => sum + review.score, 0) / movieReviews.length
    : null;
  return { ...movie, director, reviews: movieReviews, averageScore: average };
}

// Misma informacion, pero esperando una por una (mas lento).
async function loadSequential(id) {
  const movie = await findMovie(id);
  await findDirector(movie.directorId);
  await findReviews(id);
}

async function loadParallel(id) {
  const movie = await findMovie(id);
  await Promise.all([findDirector(movie.directorId), findReviews(id)]);
}

async function benchmark(id) {
  let start = Date.now();
  await loadSequential(id);
  const sequentialMs = Date.now() - start;

  start = Date.now();
  await loadParallel(id);
  const parallelMs = Date.now() - start;

  return { sequentialMs, parallelMs };
}

module.exports = { getMovieDetail, benchmark };
