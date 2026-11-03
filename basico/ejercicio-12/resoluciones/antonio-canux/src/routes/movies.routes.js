import { Router } from 'express';
import {
  getStatus,
  getMovies,
  getMovieById,
  searchMovies,
  createMovie,
  getRandomScare
} from '../controllers/movies.controller.js';

const router = Router();

// Endpoint base del ejercicio: /basico/ejercicio-12
router.get('/', getStatus);

// Endpoints de películas de miedo
router.get('/movies', getMovies);
router.get('/movies/search', searchMovies);
router.get('/movies/random', getRandomScare);
router.get('/movies/:id', getMovieById);
router.post('/movies', createMovie);

export default router;
