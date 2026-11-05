const TRACKS = [
  { name: "Bohemian Rhapsody", duration: "5:55", artist: "Queen" },
  { name: "Stairway to Heaven", duration: "8:02", artist: "Led Zeppelin" },
  { name: "Hotel California", duration: "6:30", artist: "Eagles" },
  { name: "Smells Like Teen Spirit", duration: "5:01", artist: "Nirvana" },
  { name: "Imagine", duration: "3:07", artist: "John Lennon" },
  { name: "Billie Jean", duration: "4:54", artist: "Michael Jackson" },
];

/**
 * Simula reproducir un track con una Promesa.
 * @param {string} trackName - Nombre del track a buscar
 * @returns {Promise} Resuelve con info del track o rechaza si no se encuentra
 */
export function playTrack(trackName) {
  return new Promise((resolve, reject) => {
    if (!trackName || typeof trackName !== "string" || trackName.trim() === "") {
      reject(new Error("El nombre del track es obligatorio."));
      return;
    }

    const delay = Math.floor(Math.random() * 1500) + 500;

    setTimeout(() => {
      const track = TRACKS.find(
        (t) => t.name.toLowerCase().includes(trackName.trim().toLowerCase())
      );

      if (!track) {
        reject(new Error(`Track "${trackName}" no encontrado en la playlist.`));
        return;
      }

      resolve({
        ...track,
        status: "reproduciendo",
        startedAt: new Date().toLocaleTimeString(),
      });
    }, delay);
  });
}
