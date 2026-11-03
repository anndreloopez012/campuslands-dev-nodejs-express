import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/movies.json");

// Helper asíncrono para simular latencia de servidor/procesamiento
const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper asíncrono para leer el archivo JSON
const readMoviesFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

// Helper asíncrono para escribir en el archivo JSON
const writeMoviesFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

// Servicio para obtener todas las películas con async/await
export const getAllMoviesService = async () => {
  await simulateDelay(150);
  return await readMoviesFile();
};

// Servicio para buscar película por ID
export const getMovieByIdService = async (id) => {
  await simulateDelay(100);
  const movies = await readMoviesFile();
  return movies.find((movie) => movie.id === String(id));
};

// Servicio para evaluar el "medidor de susto" de una película
export const analyzeScareLevelService = async (id) => {
  await simulateDelay(200);
  const movies = await readMoviesFile();
  const movie = movies.find((m) => m.id === String(id));

  if (!movie) return null;

  let warningMessage = "Apta para maratón nocturno con amigos.";
  if (movie.scareLevel >= 8) {
    warningMessage = "¡Precaución! Nivel extremo de sustos y tensión psicológica.";
  }

  return {
    id: movie.id,
    title: movie.title,
    scareLevel: movie.scareLevel,
    subgenre: movie.subgenre,
    warning: warningMessage
  };
};

// Servicio para crear una nueva película de miedo
export const createMovieService = async ({ title, director, subgenre, scareLevel, releaseYear }) => {
  await simulateDelay(200);
  const movies = await readMoviesFile();

  const titleExists = movies.some(
    (m) => m.title.toLowerCase() === title.toLowerCase()
  );

  if (titleExists) {
    const error = new Error(`La película '${title}' ya está registrada en el catálogo de terror.`);
    error.statusCode = 409;
    throw error;
  }

  const newMovie = {
    id: String(Date.now()),
    title,
    director,
    subgenre,
    scareLevel: Number(scareLevel),
    releaseYear: Number(releaseYear)
  };

  movies.push(newMovie);
  await writeMoviesFile(movies);

  return newMovie;
};