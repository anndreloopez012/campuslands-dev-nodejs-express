import * as moviesService from "../services/movies.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMoviesController = asyncHandler(async (req, res) => {
  const movies = await moviesService.getAllMoviesService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: movies.length,
    data: movies
  });
});

export const getMovieByIdController = asyncHandler(async (req, res) => {
  const movie = await moviesService.getMovieByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: movie
  });
});