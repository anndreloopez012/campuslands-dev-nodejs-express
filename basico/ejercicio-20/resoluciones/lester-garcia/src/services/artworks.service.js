import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/artworks.json");

const readArtworksFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeArtworksFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllArtworksService = async () => {
  return await readArtworksFile();
};

export const getArtworkByIdService = async (id) => {
  const artworks = await readArtworksFile();
  const artwork = artworks.find((a) => a.id === String(id));

  if (!artwork) {
    throw new NotFoundError(`La ilustración con ID '${id}' no existe en la galería.`);
  }

  return artwork;
};

export const createArtworkService = async ({
  title,
  artist,
  software,
  canvasWidth,
  canvasHeight,
  layersCount,
  priceUSD,
  isCommercialUse
}) => {
  const artworks = await readArtworksFile();

  const titleExists = artworks.some(
    (a) => a.title.toLowerCase() === title.toLowerCase() && a.artist.toLowerCase() === artist.toLowerCase()
  );

  if (titleExists) {
    throw new ConflictError(`La obra '${title}' del artista '${artist}' ya está en la plataforma.`);
  }

  const newArtwork = {
    id: String(Date.now()),
    title,
    artist,
    software,
    canvasWidth: Number(canvasWidth),
    canvasHeight: Number(canvasHeight),
    layersCount: Number(layersCount),
    priceUSD: Number(priceUSD),
    isCommercialUse: isCommercialUse !== undefined ? Boolean(isCommercialUse) : false
  };

  artworks.push(newArtwork);
  await writeArtworksFile(artworks);

  return newArtwork;
};