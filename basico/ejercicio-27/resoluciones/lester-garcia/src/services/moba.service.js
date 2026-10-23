import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/mobaMatches.json");

const readMatchesFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeMatchesFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllMatchesService = async (filters = {}) => {
  let matches = await readMatchesFile();
  const { tournamentName, patch, winner } = filters;

  if (tournamentName) {
    matches = matches.filter((m) =>
      m.tournamentName.toLowerCase().includes(tournamentName.toLowerCase())
    );
  }

  if (patch) {
    matches = matches.filter((m) => m.patch.toLowerCase() === patch.toLowerCase());
  }

  if (winner) {
    matches = matches.filter(
      (m) => m.winner.toLowerCase() === winner.toLowerCase()
    );
  }

  return matches;
};

export const getMatchByIdService = async (id) => {
  const matches = await readMatchesFile();
  const match = matches.find((m) => m.id === String(id));

  if (!match) {
    throw new NotFoundError(`La partida MOBA con ID '${id}' no fue encontrada.`);
  }

  return match;
};

export const createMatchService = async ({
  tournamentName,
  teamA,
  teamB,
  patch,
  durationMinutes,
  winner,
  totalKills
}) => {
  const matches = await readMatchesFile();

  const matchExists = matches.some(
    (m) =>
      m.tournamentName.toLowerCase() === tournamentName.toLowerCase() &&
      m.teamA.toLowerCase() === teamA.toLowerCase() &&
      m.teamB.toLowerCase() === teamB.toLowerCase()
  );

  if (matchExists) {
    throw new ConflictError(`Ya existe un enfrentamiento registrado entre '${teamA}' y '${teamB}' en '${tournamentName}'.`);
  }

  const newMatch = {
    id: String(Date.now()),
    tournamentName,
    teamA,
    teamB,
    patch,
    durationMinutes: Number(durationMinutes),
    winner,
    totalKills: Number(totalKills)
  };

  matches.push(newMatch);
  await writeMatchesFile(matches);

  return newMatch;
};