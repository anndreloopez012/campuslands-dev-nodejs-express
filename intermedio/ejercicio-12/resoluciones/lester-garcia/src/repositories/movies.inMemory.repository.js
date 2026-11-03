const inMemoryMovies = [
  {
    id: "1",
    title: "Hereditary",
    director: "Ari Aster",
    subgenre: "Terror Psicológico",
    releaseYear: 2018,
    durationMinutes: 127
  },
  {
    id: "2",
    title: "The Conjuring",
    director: "James Wan",
    subgenre: "Sobrenatural",
    releaseYear: 2013,
    durationMinutes: 112
  },
  {
    id: "3",
    title: "Alien",
    director: "Ridley Scott",
    subgenre: "Ciencia Ficción y Terror",
    releaseYear: 1979,
    durationMinutes: 117
  }
];

export const findAllMovies = async () => [...inMemoryMovies];

export const findMovieById = async (id) => {
  const movie = inMemoryMovies.find((m) => m.id === String(id));
  return movie ? { ...movie } : null;
};