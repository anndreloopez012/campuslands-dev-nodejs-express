import {
  getAllMoviesService,
  getMovieByIdService,
  analyzeScareLevelService,
  createMovieService
} from "../services/movies.service.js";

export const getMoviesController = async (req, res) => {
  try {
    const movies = await getAllMoviesService();
    return res.status(200).json({
      status: "success",
      total: movies.length,
      data: movies
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al recuperar la lista de películas de terror."
    });
  }
};

export const getMovieByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await getMovieByIdService(id);

    if (!movie) {
      return res.status(404).json({
        status: "error",
        message: `La película de miedo con ID '${id}' no fue encontrada.`
      });
    }

    return res.status(200).json({
      status: "success",
      data: movie
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al buscar la película especificada."
    });
  }
};

export const analyzeScareController = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await analyzeScareLevelService(id);

    if (!analysis) {
      return res.status(404).json({
        status: "error",
        message: `No se pudo analizar el nivel de susto para el ID '${id}'.`
      });
    }

    return res.status(200).json({
      status: "success",
      data: analysis
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al procesar la evaluación de sustos."
    });
  }
};

export const createMovieController = async (req, res) => {
  try {
    const { title, director, subgenre, scareLevel, releaseYear } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El campo 'title' es obligatorio y debe ser un texto válido."
      });
    }

    if (!director || typeof director !== "string" || director.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El campo 'director' es obligatorio y debe ser un texto válido."
      });
    }

    if (!subgenre || typeof subgenre !== "string" || subgenre.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El campo 'subgenre' es obligatorio y debe ser un texto válido."
      });
    }

    const numericScare = Number(scareLevel);
    if (scareLevel === undefined || isNaN(numericScare) || numericScare < 1 || numericScare > 10) {
      return res.status(400).json({
        status: "error",
        message: "El campo 'scareLevel' debe ser un número entre 1 y 10."
      });
    }

    if (releaseYear === undefined || isNaN(Number(releaseYear))) {
      return res.status(400).json({
        status: "error",
        message: "El campo 'releaseYear' debe ser un número de año válido."
      });
    }

    const newMovie = await createMovieService({
      title: title.trim(),
      director: director.trim(),
      subgenre: subgenre.trim(),
      scareLevel: numericScare,
      releaseYear
    });

    return res.status(201).json({
      status: "success",
      data: newMovie
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Error al registrar la película de miedo."
    });
  }
};