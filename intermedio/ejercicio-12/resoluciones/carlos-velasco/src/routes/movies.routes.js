const { Router } = require('express');
const moviesController = require('../controllers/movies.controller');
const reviewsController = require('../controllers/reviews.controller');

const router = Router();

router.get('/movies', moviesController.listarPeliculas);
router.get('/movies/:id', moviesController.obtenerPelicula);
router.post('/movies', moviesController.crearPelicula);

// Subrecurso: resenas siempre dependen de una pelicula existente.
// En las rutas internas, `:id` representa la resena, no la pelicula.
router.get('/movies/:peliculaId/reviews', reviewsController.listarResenas);
router.get('/movies/:peliculaId/reviews/:id', reviewsController.obtenerResena);
router.post('/movies/:peliculaId/reviews', reviewsController.crearResena);
router.delete('/movies/:peliculaId/reviews/:id', reviewsController.eliminarResena);

module.exports = router;
