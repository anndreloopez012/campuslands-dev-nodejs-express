import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/champions.json");

export const findAllChampions = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

export const findChampionById = async (id) => {
  const champions = await findAllChampions();
  return champions.find((c) => c.id === String(id)) || null;
};

export const findChampionByName = async (name) => {
  const champions = await findAllChampions();
  return champions.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
};

export const saveChampion = async (newChampion) => {
  const champions = await findAllChampions();
  champions.push(newChampion);
  await fs.writeFile(DATA_PATH, JSON.stringify(champions, null, 2), "utf-8");
  return newChampion;
};

export const updateChampionInStore = async (id, updatedData) => {
  const champions = await findAllChampions();
  const index = champions.findIndex((c) => c.id === String(id));

  if (index === -1) return null;

  champions[index] = { ...champions[index], ...updatedData, id: String(id) };
  await fs.writeFile(DATA_PATH, JSON.stringify(champions, null, 2), "utf-8");
  return champions[index];
};

export const deleteChampionFromStore = async (id) => {
  const champions = await findAllChampions();
  const index = champions.findIndex((c) => c.id === String(id));

  if (index === -1) return false;

  champions.splice(index, 1);
  await fs.writeFile(DATA_PATH, JSON.stringify(champions, null, 2), "utf-8");
  return true;
};