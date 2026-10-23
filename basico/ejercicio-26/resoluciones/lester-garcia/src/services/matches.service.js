import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/matches.json");

const readMatchesFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeMatchesFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllMatchesService = async (filters = {}) => {
  let matches = await readMatchesFile();
  const { gameMode, isTournamentMatch, mapName } = filters;

  if (gameMode) {
    matches = matches.filter(
      (m) => m.gameMode.toLowerCase() === gameMode.toLowerCase()
    );
  }

  if (mapName) {
    matches = matches.filter((m) =>
      m.mapName.toLowerCase().includes(mapName.toLowerCase())
    );
  }

  if (isTournamentMatch !== undefined) {
    const isTournament = isTournamentMatch === "true";
    matches = matches.filter((m) => m.isTournamentMatch === isTournament);
  }

  return matches;
};

export const getMatchByIdService = async (id) => {
  const matches = await readMatchesFile();
  const match = matches.find((m) => m.id === String(id));

  if (!match) {
    throw new NotFoundError(`La partida con ID '${id}' no se encuentra registrada.`);
  }

  return match;
};

export const createMatchService = async ({
  matchCode,
  mapName,
  gameMode,
  winningTeam,
  score,
  durationMinutes,
  mvpPlayer,
  isTournamentMatch
}) => {
  const matches = await readMatchesFile();

  const codeExists = matches.some(
    (m) => m.matchCode.toLowerCase() === matchCode.toLowerCase()
  );

  if (codeExists) {
    throw new ConflictError(`El código de lobby '${matchCode}' ya está registrado.`);
  }

  const newMatch = {
    id: String(Date.now()),
    matchCode,
    mapName,
    gameMode,
    winningTeam,
    score,
    durationMinutes: Number(durationMinutes),
    mvpPlayer,
    isTournamentMatch: isTournamentMatch !== undefined ? Boolean(isTournamentMatch) : false
  };

  matches.push(newMatch);
  await writeMatchesFile(matches);

  return newMatch;
};

export const deleteMatchService = async (id) => {
  const matches = await readMatchesFile();
  const index = matches.findIndex((m) => m.id === String(id));

  if (index === -1) {
    throw new NotFoundError(`No se puede eliminar. La partida con ID '${id}' no existe.`);
  }

  matches.splice(index, 1);
  await writeMatchesFile(matches);
};