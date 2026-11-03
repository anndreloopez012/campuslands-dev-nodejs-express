import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/songs.json");

// Helper para leer el archivo JSON
const readSongsFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

// Helper para escribir en el archivo JSON
const writeSongsFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

// Promesa básica para obtener la lista de canciones
export const getAllSongsService = () => {
  return new Promise((resolve, reject) => {
    readSongsFile()
      .then((songs) => resolve(songs))
      .catch((err) => reject(new Error("Error al leer el catálogo de canciones: " + err.message)));
  });
};

// Promesa básica para verificar disponibilidad de procesamiento de audio
export const verifyAudioQualityService = (durationSeconds) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (durationSeconds < 30) {
        reject(new Error("La canción es demasiado corta. Debe durar al menos 30 segundos."));
      } else if (durationSeconds > 600) {
        reject(new Error("La canción excede el límite permitido de 10 minutos (600s)."));
      } else {
        resolve({
          quality: "24-bit / 96kHz Lossless",
          status: "Audio calificado para procesamiento Master"
        });
      }
    }, 150); // Simulación de procesamiento asíncrono
  });
};

// Promesa básica para agregar una nueva canción con validación explícita mediante reject
export const addSongService = (songData) => {
  return new Promise((resolve, reject) => {
    const { title, artist, genre, durationSeconds } = songData;

    readSongsFile()
      .then((songs) => {
        // Validación de duplicados
        const exists = songs.some(
          (s) => s.title.toLowerCase() === title.toLowerCase() && s.artist.toLowerCase() === artist.toLowerCase()
        );

        if (exists) {
          return reject(new Error(`La canción '${title}' de '${artist}' ya existe en el catálogo.`));
        }

        const newSong = {
          id: String(Date.now()),
          title,
          artist,
          genre,
          durationSeconds: Number(durationSeconds)
        };

        songs.push(newSong);

        return writeSongsFile(songs).then(() => resolve(newSong));
      })
      .catch((err) => reject(new Error("Error en la persistencia de la canción: " + err.message)));
  });
};