const TOOLS = ["procreate", "krita", "photoshop", "clip-studio"];

const artworks = [
  { id: 1, title: "Ciudad Neon", artist: "Lia Torres", tool: "procreate", layers: 42 },
  { id: 2, title: "Bosque de Cristal", artist: "Omar Vidal", tool: "krita", layers: 27 },
];
let nextId = 3;

const listArtworks = () => artworks;
const getArtworkById = (id) => artworks.find((a) => a.id === Number(id)) || null;

function createArtwork({ title, artist, tool, layers }) {
  if (!title || typeof title !== "string" || !title.trim()) throw new Error("title es obligatorio");
  if (!artist || typeof artist !== "string" || !artist.trim()) throw new Error("artist es obligatorio");
  if (!TOOLS.includes(tool)) throw new Error(`tool debe ser una de: ${TOOLS.join(", ")}`);

  const numericLayers = layers === undefined ? 1 : Number(layers);
  if (!Number.isInteger(numericLayers) || numericLayers < 1) throw new Error("layers debe ser un entero mayor a 0");

  const artwork = { id: nextId++, title: title.trim(), artist: artist.trim(), tool, layers: numericLayers };
  artworks.push(artwork);
  return artwork;
}

export { listArtworks, getArtworkById, createArtwork };
