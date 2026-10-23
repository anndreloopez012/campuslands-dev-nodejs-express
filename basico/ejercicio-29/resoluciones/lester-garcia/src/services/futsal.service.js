import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/futsalMatches.json");

const readMatchesFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeMatchesFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllMatchesService = async (filters = {}) => {
  let matches = await readMatchesFile();
  const { matchStatus, surfaceType, team } = filters;

  if (matchStatus) {
    matches = matches.filter(
      (m) => m.matchStatus.toLowerCase() === matchStatus.toLowerCase()
    );
  }

  if (surfaceType) {
    matches = matches.filter((m) =>
      m.surfaceType.toLowerCase().includes(surfaceType.toLowerCase())
    );
  }

  if (team) {
    matches = matches.filter(
      (m) =>
        m.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
        m.awayTeam.toLowerCase().includes(team.toLowerCase())
    );
  }

  return matches;
};

export const getMatchByIdService = async (id) => {
  const matches = await readMatchesFile();
  const match = matches.find((m) => m.id === String(id));

  if (!match) {
    throw new NotFoundError(`El partido con ID '${id}' no existe.`);
  }

  return match;
};

export const createMatchService = async ({
  matchCode,
  homeTeam,
  awayTeam,
  homeGoals,
  awayGoals,
  surfaceType,
  matchStatus
}) => {
  const matches = await readMatchesFile();

  const codeExists = matches.some(
    (m) => m.matchCode.toLowerCase() === matchCode.toLowerCase()
  );

  if (codeExists) {
    throw new ConflictError(`El código de partido '${matchCode}' ya se encuentra registrado.`);
  }

  const newMatch = {
    id: String(Date.now()),
    matchCode,
    homeTeam,
    awayTeam,
    homeGoals: homeGoals !== undefined ? Number(homeGoals) : 0,
    awayGoals: awayGoals !== undefined ? Number(awayGoals) : 0,
    surfaceType,
    matchStatus: matchStatus || "Scheduled"
  };

  matches.push(newMatch);
  await writeMatchesFile(matches);

  return newMatch;
};