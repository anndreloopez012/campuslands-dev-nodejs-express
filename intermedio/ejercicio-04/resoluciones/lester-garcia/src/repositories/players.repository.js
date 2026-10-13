import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/players.json");

export const findAllPlayers = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

export const findPlayerById = async (id) => {
  const players = await findAllPlayers();
  return players.find((p) => p.id === String(id)) || null;
};

export const findPlayerByGamertag = async (gamertag) => {
  const players = await findAllPlayers();
  return players.find((p) => p.gamertag.toLowerCase() === gamertag.toLowerCase()) || null;
};