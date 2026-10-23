import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/fighters.json");

// Helper para leer el archivo JSON
const readFightersFile = async () => {
  const fileData = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(fileData);
};

// Helper para escribir los cambios en el archivo JSON
const writeFightersFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllFightersService = async () => {
  return await readFightersFile();
};

export const createFighterService = async ({ name, weightClass, wins = 0, losses = 0, kos = 0 }) => {
  const fighters = await readFightersFile();

  const newFighter = {
    id: String(Date.now()),
    name,
    weightClass,
    wins: Number(wins),
    losses: Number(losses),
    kos: Number(kos)
  };

  fighters.push(newFighter);
  await writeFightersFile(fighters);

  return newFighter;
};