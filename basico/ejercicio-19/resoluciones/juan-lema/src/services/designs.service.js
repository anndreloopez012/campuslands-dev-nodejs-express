import { readFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/designs.json", import.meta.url);

async function getDesignsByArtist(artistId, { style, minPrice, maxPrice } = {}) {
  const raw = await readFile(DATA_PATH, "utf-8");
  const designs = JSON.parse(raw);

  return designs.filter((d) => {
    if (d.artistId !== Number(artistId)) return false;
    if (style && d.style !== style) return false;
    if (minPrice !== undefined && d.price < Number(minPrice)) return false;
    if (maxPrice !== undefined && d.price > Number(maxPrice)) return false;
    return true;
  });
}

export { getDesignsByArtist };
