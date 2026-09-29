import { fetchMovie, fetchRating } from "./services/movies.service.js";

async function main() {
  const titleArg = process.argv.length > 2 ? process.argv[2] : "El Conjuro";

  try {
    const movie = await fetchMovie(titleArg);
    const rating = await fetchRating(movie.id);

    console.log("Pelicula encontrada:");
    console.table({ ...movie, rating: rating.rating });
  } catch (error) {
    console.error(`Error al buscar pelicula: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
