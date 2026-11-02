import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/lobbies.json");

export const findAllLobbies = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

export const findLobbyById = async (id) => {
  const lobbies = await findAllLobbies();
  return lobbies.find((l) => l.id === String(id)) || null;
};

export const findLobbyByCode = async (code) => {
  const lobbies = await findAllLobbies();
  return lobbies.find((l) => l.lobbyCode.toLowerCase() === code.toLowerCase()) || null;
};

export const saveLobby = async (lobbyData) => {
  const lobbies = await findAllLobbies();
  lobbies.push(lobbyData);
  await fs.writeFile(DATA_PATH, JSON.stringify(lobbies, null, 2), "utf-8");
  return lobbyData;
};

export const updateLobbyInStore = async (id, updatedData) => {
  const lobbies = await findAllLobbies();
  const index = lobbies.findIndex((l) => l.id === String(id));
  if (index === -1) return null;

  lobbies[index] = { ...lobbies[index], ...updatedData, id: String(id) };
  await fs.writeFile(DATA_PATH, JSON.stringify(lobbies, null, 2), "utf-8");
  return lobbies[index];
};