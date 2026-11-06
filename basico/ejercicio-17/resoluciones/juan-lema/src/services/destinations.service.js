import { readFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/destinations.json", import.meta.url);

async function getAll() {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function getById(id) {
  const destinations = await getAll();
  return destinations.find((d) => d.id === Number(id)) || null;
}

export { getAll, getById };
