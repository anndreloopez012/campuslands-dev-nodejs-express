import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, "..", "data", "designs.json");

const loadData = async () => {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
};

export const getByArtist = async (artistId, filters = {}) => {
  if (isNaN(artistId)) {
    return { error: "artistId debe ser numérico", status: 400 };
  }

  const id = Number(artistId);
  const all = await loadData();
  let results = all.filter((d) => d.artistId === id);

  if (results.length === 0) {
    return { error: "No se encontraron diseños para ese artista", status: 404 };
  }

  if (filters.style) {
    results = results.filter((d) => d.style === filters.style);
  }

  if (filters.minPrice !== undefined) {
    const min = Number(filters.minPrice);
    if (isNaN(min)) return { error: "minPrice debe ser numérico", status: 400 };
    results = results.filter((d) => d.minPrice >= min);
  }

  if (filters.maxPrice !== undefined) {
    const max = Number(filters.maxPrice);
    if (isNaN(max)) return { error: "maxPrice debe ser numérico", status: 400 };
    results = results.filter((d) => d.minPrice <= max);
  }

  return { data: results };
};
