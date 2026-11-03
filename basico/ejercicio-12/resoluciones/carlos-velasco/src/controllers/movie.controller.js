const movieService = require('../services/movie.service');

const getMovie = async (req, res) => {
  try {
    const movieId = Number(req.params.id);

    const movie = await movieService.getMovie(movieId);

    res.status(200).json({
      ok: true,
      message: 'Pelicula obtenida correctamente',
      topic: 'async await',
      data: movie
    });
  } catch (error) {
    console.error('Error al obtener la pelicula:', error.message);

    res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};

module.exports = {
  getMovie
};