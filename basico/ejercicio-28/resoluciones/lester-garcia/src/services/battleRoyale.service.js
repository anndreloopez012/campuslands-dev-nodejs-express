import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/lobbies.json");

const readLobbiesFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeLobbiesFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllLobbiesService = async (filters = {}) => {
  let lobbies = await readLobbiesFile();
  const { gameMode, isServerActive, mapName } = filters;

  if (gameMode) {
    lobbies = lobbies.filter(
      (l) => l.gameMode.toLowerCase() === gameMode.toLowerCase()
    );
  }

  if (mapName) {
    lobbies = lobbies.filter((l) =>
      l.mapName.toLowerCase().includes(mapName.toLowerCase())
    );
  }

  if (isServerActive !== undefined) {
    const isActive = isServerActive === "true";
    lobbies = lobbies.filter((l) => l.isServerActive === isActive);
  }

  return lobbies;
};

export const getLobbyByIdService = async (id) => {
  const lobbies = await readLobbiesFile();
  const lobby = lobbies.find((l) => l.id === String(id));

  if (!lobby) {
    throw new NotFoundError(`El lobby con ID '${id}' no fue encontrado.`);
  }

  return lobby;
};

export const createLobbyService = async ({
  lobbyCode,
  mapName,
  maxPlayers,
  currentPlayers,
  gameMode,
  isServerActive
}) => {
  const lobbies = await readLobbiesFile();

  const codeExists = lobbies.some(
    (l) => l.lobbyCode.toLowerCase() === lobbyCode.toLowerCase()
  );

  if (codeExists) {
    throw new ConflictError(`El código de lobby '${lobbyCode}' ya está activo.`);
  }

  const newLobby = {
    id: String(Date.now()),
    lobbyCode,
    mapName,
    maxPlayers: Number(maxPlayers),
    currentPlayers: currentPlayers !== undefined ? Number(currentPlayers) : 0,
    gameMode,
    isServerActive: isServerActive !== undefined ? Boolean(isServerActive) : true
  };

  lobbies.push(newLobby);
  await writeLobbiesFile(lobbies);

  return newLobby;
};