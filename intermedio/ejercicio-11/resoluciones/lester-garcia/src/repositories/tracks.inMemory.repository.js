const inMemoryCatalog = [
  {
    id: "1",
    title: "Canción del Ocaso",
    artist: "Stellar Horizon",
    album: "Neon Dreams",
    genre: "Synthwave",
    durationSeconds: 245,
    bpm: 118,
    releaseYear: 2024
  },
  {
    id: "2",
    title: "Sinfonía Eléctrica",
    artist: "Cyber Orchestra",
    album: "Futuro Clásico",
    genre: "Electrónica",
    durationSeconds: 312,
    bpm: 128,
    releaseYear: 2025
  },
  {
    id: "3",
    title: "Midnight Jazz Session",
    artist: "The Blue Notes Quintet",
    album: "Rainy Streets",
    genre: "Jazz",
    durationSeconds: 198,
    bpm: 85,
    releaseYear: 2023
  },
  {
    id: "4",
    title: "Rebelión en la Ciudad",
    artist: "Furia Urbana",
    album: "Guitarras y Asfalto",
    genre: "Rock",
    durationSeconds: 215,
    bpm: 142,
    releaseYear: 2024
  },
  {
    id: "5",
    title: "Océano de Luces",
    artist: "Stellar Horizon",
    album: "Neon Dreams",
    genre: "Synthwave",
    durationSeconds: 260,
    bpm: 120,
    releaseYear: 2024
  },
  {
    id: "6",
    title: "Acoustic Morning",
    artist: "Luna Solitaria",
    album: "Café de Otoño",
    genre: "Indie",
    durationSeconds: 180,
    bpm: 92,
    releaseYear: 2026
  }
];

export const findAllTracks = async () => [...inMemoryCatalog];

export const findTrackById = async (id) => {
  const track = inMemoryCatalog.find((t) => t.id === String(id));
  return track ? { ...track } : null;
};