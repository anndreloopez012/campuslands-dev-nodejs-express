import * as moviesRepo from "../repositories/movies.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getAllMoviesService = async () => {
  return await moviesRepo.findAllMovies();
};

export const getMovieByIdService = async (id) => {
  const movie = await moviesRepo.findMovieById(id);
  if (!movie) {
    throw new NotFoundError(`La película de terror con ID '${id}' no existe.`);
  }
  return movie;
};