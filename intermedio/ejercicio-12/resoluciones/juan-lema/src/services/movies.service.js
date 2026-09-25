const movies = [
  { id: 1, title: "La Casa del Bosque", year: 2019, director: "Elena Vargas" },
  { id: 2, title: "Susurros en el Sotano", year: 2021, director: "Tomas Reyes" },
  { id: 3, title: "El Ultimo Espejo", year: 2023, director: "Clara Nunez" },
];
let nextId = 4;

const listMovies = () => movies;
const getMovieById = (id) => movies.find((m) => m.id === Number(id)) || null;

function createMovie({ title, year, director }) {
  if (!title || typeof title !== "string" || !title.trim()) throw new Error("title es obligatorio");
  if (!director || typeof director !== "string" || !director.trim()) throw new Error("director es obligatorio");

  const numericYear = Number(year);
  if (!Number.isInteger(numericYear) || numericYear < 1890) throw new Error("year debe ser un entero valido");

  const movie = { id: nextId++, title: title.trim(), year: numericYear, director: director.trim() };
  movies.push(movie);
  return movie;
}

export { listMovies, getMovieById, createMovie };
