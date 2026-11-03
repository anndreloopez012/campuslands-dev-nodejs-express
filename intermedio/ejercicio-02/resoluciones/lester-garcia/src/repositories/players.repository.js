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

export const findAsyncPlayerById = async (id) => {
  const players = await findAllPlayers();
  return players.find((p) => p.id === String(id)) || null;
};

export const savePlayer = async (playerData) => {
  const players = await findAllPlayers();
  players.push(playerData);
  await fs.writeFile(DATA_PATH, JSON.stringify(players, null, 2), "utf-8");
  return playerData;
};