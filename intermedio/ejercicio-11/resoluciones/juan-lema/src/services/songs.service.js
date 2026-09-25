const songs = [
  { id: 1, title: "Cancion del Mariachi", artist: "Los Tres Caballeros", genre: "mariachi" },
  { id: 2, title: "Noche de Rock", artist: "Electric Lobos", genre: "rock" },
  { id: 3, title: "Corazon de Salsa", artist: "Orquesta Candela", genre: "salsa" },
  { id: 4, title: "Rock del Amanecer", artist: "Sol Naciente", genre: "rock" },
  { id: 5, title: "Balada de Invierno", artist: "Maria Olivares", genre: "balada" },
];
let nextId = 6;

const normalize = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function searchSongs(query) {
  if (!query) return songs;

  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return songs.filter((song) => {
    const haystack = normalize(`${song.title} ${song.artist} ${song.genre}`);
    return terms.every((term) => haystack.includes(term));
  });
}

const getSongById = (id) => songs.find((s) => s.id === Number(id)) || null;

function createSong({ title, artist, genre }) {
  if (!title || typeof title !== "string" || !title.trim()) throw new Error("title es obligatorio");
  if (!artist || typeof artist !== "string" || !artist.trim()) throw new Error("artist es obligatorio");
  if (!genre || typeof genre !== "string" || !genre.trim()) throw new Error("genre es obligatorio");

  const song = { id: nextId++, title: title.trim(), artist: artist.trim(), genre: genre.trim().toLowerCase() };
  songs.push(song);
  return song;
}

export { searchSongs, getSongById, createSong };
