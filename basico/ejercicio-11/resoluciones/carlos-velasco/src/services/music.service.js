const getSong = (songId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isInteger(songId) || songId <= 0) {
        reject(new Error('El identificador de la cancion no es valido'));
        return;
      }

      resolve({
        id: songId,
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        genre: 'Rock',
        duration: '5:55'
      });
    }, 500);
  });
};

module.exports = {
  getSong
};