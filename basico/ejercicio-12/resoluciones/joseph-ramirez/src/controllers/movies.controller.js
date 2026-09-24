const moviesService = require("../services/movies.service");

async function getMovies(req, res) {
  try {
    const movies = await moviesService.getAllMovies();

    res.status(200).json({
      ok: true,
      message: "Peliculas obtenidas correctamente",
      total: movies.length,
      data: movies
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener las peliculas"
    });
  }
}

async function getMovieById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID debe ser un numero entero positivo"
      });
    }

    const movie = await moviesService.getMovieById(id);

    if (!movie) {
      return res.status(404).json({
        ok: false,
        message: "Pelicula no encontrada"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Pelicula encontrada correctamente",
      data: movie
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al buscar la pelicula"
    });
  }
}

async function getMoviesByGenre(req, res) {
  try {
    const { genre } = req.params;

    if (!genre || !genre.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El genero es obligatorio"
      });
    }

    const movies = await moviesService.getMoviesByGenre(genre);

    if (movies.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron peliculas de ese genero"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Peliculas encontradas correctamente",
      total: movies.length,
      data: movies
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al buscar peliculas por genero"
    });
  }
}

async function getHighestRatedMovie(req, res) {
  try {
    const movie = await moviesService.getHighestRatedMovie();

    res.status(200).json({
      ok: true,
      message: "Pelicula mejor calificada obtenida correctamente",
      data: movie
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener la pelicula mejor calificada"
    });
  }
}

module.exports = {
  getMovies,
  getMovieById,
  getMoviesByGenre,
  getHighestRatedMovie
};