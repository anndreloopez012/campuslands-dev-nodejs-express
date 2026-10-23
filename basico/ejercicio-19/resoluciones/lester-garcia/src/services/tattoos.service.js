import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/tattoos.json");

const readTattoosFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

export const getTattoosService = async (filters = {}) => {
  let tattoos = await readTattoosFile();
  const { style, artist, maxPrice, available } = filters;

  if (style) {
    tattoos = tattoos.filter(
      (t) => t.style.toLowerCase() === style.toLowerCase()
    );
  }

  if (artist) {
    tattoos = tattoos.filter((t) =>
      t.artist.toLowerCase().includes(artist.toLowerCase())
    );
  }

  if (maxPrice) {
    const numericMaxPrice = Number(maxPrice);
    tattoos = tattoos.filter((t) => t.priceUSD <= numericMaxPrice);
  }

  if (available !== undefined) {
    const isAvailable = available === "true";
    tattoos = tattoos.filter((t) => t.available === isAvailable);
  }

  return tattoos;
};

export const getTattooByIdService = async (id) => {
  const tattoos = await readTattoosFile();
  const tattoo = tattoos.find((t) => t.id === String(id));

  if (!tattoo) {
    throw new NotFoundError(`No se encontró ningún diseño de tatuaje con el ID '${id}'.`);
  }

  return tattoo;
};

export const getTattoosByArtistService = async (artistName) => {
  const tattoos = await readTattoosFile();
  const filtered = tattoos.filter((t) =>
    t.artist.toLowerCase().includes(artistName.toLowerCase())
  );

  if (filtered.length === 0) {
    throw new NotFoundError(`No hay piezas registradas para el artista '${artistName}'.`);
  }

  return filtered;
};