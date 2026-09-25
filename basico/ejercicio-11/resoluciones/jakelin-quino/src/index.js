const songs = [
  { title: 'Luz de neon', genre: 'pop' },
  { title: 'Ruta nocturna', genre: 'rock' },
  { title: 'Frecuencia azul', genre: 'electronica' }
];

function findSongsByGenre(genre) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = songs.filter((song) => song.genre === genre);
      if (result.length === 0) {
        reject(new Error(`No hay canciones del genero ${genre}.`));
        return;
      }
      resolve(result);
    }, 200);
  });
}

const genre = process.argv[2] || 'pop';

findSongsByGenre(genre)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });