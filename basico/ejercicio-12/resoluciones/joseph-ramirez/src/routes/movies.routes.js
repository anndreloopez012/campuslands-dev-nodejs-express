const express = require("express");
const moviesController = require("../controllers/movies.controller");

const router = express.Router();

router.get("/", moviesController.getMovies);

router.get("/top-rated", moviesController.getHighestRatedMovie);

router.get("/genre/:genre", moviesController.getMoviesByGenre);

router.get("/:id", moviesController.getMovieById);

module.exports = router;