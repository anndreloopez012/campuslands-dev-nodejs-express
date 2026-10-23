const movies = [
    {
      id: 1,
      titulo: "La Casa de las Sombras",
      director: "Daniel Morgan",
      anio: 2022,
      genero: "Terror",
      calificacion: 8.1
    },
    {
      id: 2,
      titulo: "El Ultimo Susurro",
      director: "Laura Bennett",
      anio: 2023,
      genero: "Terror Psicologico",
      calificacion: 8.5
    },
    {
      id: 3,
      titulo: "Noche en el Bosque",
      director: "Michael Stone",
      anio: 2021,
      genero: "Slasher",
      calificacion: 7.6
    },
    {
      id: 4,
      titulo: "La Habitacion 13",
      director: "Sarah Collins",
      anio: 2024,
      genero: "Terror Sobrenatural",
      calificacion: 8.8
    }
  ];
  
  function simulateAsyncOperation(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, 500);
    });
  }
  
  async function getAllMovies() {
    const result = await simulateAsyncOperation(movies);
  
    return result;
  }
  
  async function getMovieById(id) {
    const result = await simulateAsyncOperation(movies);
  
    return result.find((movie) => movie.id === id);
  }
  
  async function getMoviesByGenre(genre) {
    const result = await simulateAsyncOperation(movies);
  
    return result.filter(
      (movie) => movie.genero.toLowerCase() === genre.toLowerCase()
    );
  }
  
  async function getHighestRatedMovie() {
    const result = await simulateAsyncOperation(movies);
  
    return result.reduce((highest, movie) => {
      if (!highest || movie.calificacion > highest.calificacion) {
        return movie;
      }
  
      return highest;
    }, null);
  }
  
  module.exports = {
    getAllMovies,
    getMovieById,
    getMoviesByGenre,
    getHighestRatedMovie
  };