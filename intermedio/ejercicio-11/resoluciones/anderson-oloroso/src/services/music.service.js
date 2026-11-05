const tracks = [
  { id: 1, titulo: 'Bohemian Rhapsody', artista: 'Queen', album: 'A Night at the Opera', genero: 'Rock', duracion: '5:55' },
  { id: 2, titulo: 'Billie Jean', artista: 'Michael Jackson', album: 'Thriller', genero: 'Pop', duracion: '4:54' },
  { id: 3, titulo: 'Smells Like Teen Spirit', artista: 'Nirvana', album: 'Nevermind', genero: 'Grunge', duracion: '5:01' },
  { id: 4, titulo: 'Hotel California', artista: 'Eagles', album: 'Hotel California', genero: 'Rock Clásico', duracion: '6:30' },
  { id: 5, titulo: 'Blinding Lights', artista: 'The Weeknd', album: 'After Hours', genero: 'Synthwave', duracion: '3:20' }
];

export const searchTracks = (query) => {
  if (!query || query.trim() === '') return tracks;
  const q = query.toLowerCase().trim();
  return tracks.filter(t => 
    t.titulo.toLowerCase().includes(q) ||
    t.artista.toLowerCase().includes(q) ||
    t.album.toLowerCase().includes(q) ||
    t.genero.toLowerCase().includes(q)
  );
};
