import * as moviesService from '../services/movies.service.js';

/**
 * Estado general del ejercicio según especificación del README.
 */
export async function getStatus(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      message: "Ejercicio ejecutado correctamente",
      topic: "async await"
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al consultar estado del ejercicio",
      error: error.message
    });
  }
}

/**
 * Obtener listado de películas de miedo con filtros opcionales.
 */
export async function getMovies(req, res) {
  try {
    const { subgenre, minRating } = req.query;

    const movies = await moviesService.getAllMovies({ subgenre, minRating });

    return res.status(200).json({
      ok: true,
      message: "Películas de terror obtenidas con éxito mediante async/await",
      total: movies.length,
      data: movies
    });
  } catch (error) {
    console.error("Error en getMovies:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al recuperar el catálogo de películas",
      error: error.message
    });
  }
}

/**
 * Obtener una película por su ID con validación.
 */
export async function getMovieById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El parámetro :id debe ser un número entero positivo"
      });
    }

    const movie = await moviesService.getMovieById(id);

    if (!movie) {
      return res.status(404).json({
        ok: false,
        message: `No se encontró ninguna película de miedo con el ID ${id}`
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Película encontrada exitosamente",
      data: movie
    });
  } catch (error) {
    console.error("Error en getMovieById:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al buscar la película",
      error: error.message
    });
  }
}

/**
 * Búsqueda de películas por título a través de query params.
 */
export async function searchMovies(req, res) {
  try {
    const { title } = req.query;

    if (!title || !title.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Debes proporcionar un término de búsqueda en la query: ?title=nombre"
      });
    }

    const results = await moviesService.searchMoviesByTitle(title);

    if (results.length === 0) {
      return res.status(404).json({
        ok: false,
        message: `No se encontraron películas de terror que coincidan con '${title}'`
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Búsqueda completada satisfactoriamente",
      total: results.length,
      data: results
    });
  } catch (error) {
    console.error("Error en searchMovies:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al ejecutar la búsqueda",
      error: error.message
    });
  }
}

/**
 * Registrar una nueva película con validaciones de entrada.
 */
export async function createMovie(req, res) {
  try {
    const { title, director, year, subgenre, rating, synopsis } = req.body;

    // Validaciones de campos obligatorios
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El campo 'title' es obligatorio y debe ser un texto válido"
      });
    }

    if (!director || typeof director !== 'string' || !director.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El campo 'director' es obligatorio y debe ser un texto válido"
      });
    }

    if (!year || isNaN(Number(year)) || Number(year) < 1888 || Number(year) > 2100) {
      return res.status(400).json({
        ok: false,
        message: "El campo 'year' es obligatorio y debe ser un año válido (ej. 1980 - 2100)"
      });
    }

    if (!subgenre || typeof subgenre !== 'string' || !subgenre.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El campo 'subgenre' es obligatorio (ej. Slasher, Terror Psicológico, Gore)"
      });
    }

    if (rating === undefined || isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 10) {
      return res.status(400).json({
        ok: false,
        message: "El campo 'rating' es obligatorio y debe ser una calificación entre 0 y 10"
      });
    }

    const created = await moviesService.createMovie({
      title,
      director,
      year,
      subgenre,
      rating,
      synopsis
    });

    return res.status(201).json({
      ok: true,
      message: "Película de terror agregada correctamente",
      data: created
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        ok: false,
        message: error.message
      });
    }

    console.error("Error en createMovie:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno al crear la película",
      error: error.message
    });
  }
}

/**
 * Obtener una recomendación de susto aleatoria.
 */
export async function getRandomScare(req, res) {
  try {
    const randomMovie = await moviesService.getRandomMovie();

    if (!randomMovie) {
      return res.status(404).json({
        ok: false,
        message: "No hay películas disponibles en el catálogo"
      });
    }

    return res.status(200).json({
      ok: true,
      message: "¡Prepárate para el susto! Película aleatoria seleccionada",
      data: randomMovie
    });
  } catch (error) {
    console.error("Error en getRandomScare:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al seleccionar una película aleatoria",
      error: error.message
    });
  }
}
