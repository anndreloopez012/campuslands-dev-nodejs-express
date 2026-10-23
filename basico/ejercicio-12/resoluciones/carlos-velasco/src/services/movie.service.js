const getMovie = (movieId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isInteger(movieId) || movieId <= 0) {
        reject(new Error('El identificador de la pelicula no es valido'));
        return;
      }

      resolve({
        id: movieId,
        title: 'The Conjuring',
        year: 2013,
        genre: 'Terror',
        duration: '1h 52min'
      });
    }, 500);
  });
};

module.exports = {
  getMovie
};