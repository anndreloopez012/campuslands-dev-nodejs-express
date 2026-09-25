const songs = [
    {
      id: 1,
      titulo: "Midnight Drive",
      artista: "Neon Waves",
      genero: "Synthwave",
      duracion: 214
    },
    {
      id: 2,
      titulo: "Ocean Lights",
      artista: "Blue Horizon",
      genero: "Pop",
      duracion: 198
    },
    {
      id: 3,
      titulo: "Electric Heart",
      artista: "Digital Echo",
      genero: "Electronic",
      duracion: 225
    },
    {
      id: 4,
      titulo: "Golden Road",
      artista: "The Travelers",
      genero: "Rock",
      duracion: 242
    }
  ];
  
  function getSongs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(songs);
      }, 500);
    });
  }
  
  function getSongById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const song = songs.find((song) => song.id === id);
  
        resolve(song);
      }, 500);
    });
  }
  
  function getSongsByGenre(genre) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = songs.filter(
          (song) => song.genero.toLowerCase() === genre.toLowerCase()
        );
  
        resolve(result);
      }, 500);
    });
  }
  
  module.exports = {
    getSongs,
    getSongById,
    getSongsByGenre
  };