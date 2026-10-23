import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/players.json");

// Helper asíncrono para simular latencia de E/S o cálculo intensivo (milisegundos)
const simulateAsyncDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper asíncrono para leer el archivo JSON
const readPlayersFile = async () => {
  const fileData = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(fileData);
};

// Helper asíncrono para escribir en el archivo JSON
const writePlayersFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

// Servicio asíncrono para obtener todos los jugadores
export const getAllPlayersService = async () => {
  await simulateAsyncDelay(200); // Simula retardo asíncrono de base de datos
  return await readPlayersFile();
};

// Servicio asíncrono para buscar un jugador por ID
export const getPlayerByIdService = async (id) => {
  await simulateAsyncDelay(150);
  const players = await readPlayersFile();
  return players.find((player) => player.id === String(id));
};

// Servicio asíncrono para calcular estadísticas simuladas de un jugador
export const getPlayerStatsService = async (id) => {
  await simulateAsyncDelay(300); // Operación asíncrona simulada de análisis de métricas
  const players = await readPlayersFile();
  const player = players.find((p) => p.id === String(id));

  if (!player) return null;

  const winRate = ((player.matchesWon / (player.matchesWon + 20)) * 100).toFixed(1);

  return {
    id: player.id,
    name: player.name,
    rank: player.rank,
    estimatedWinRate: `${winRate}%`,
    status: "Active Competitor"
  };
};

// Servicio asíncrono para crear un nuevo jugador
export const createPlayerService = async ({ name, playstyle, rank, matchesWon = 0 }) => {
  await simulateAsyncDelay(250);
  const players = await readPlayersFile();

  const newPlayer = {
    id: String(Date.now()),
    name,
    playstyle,
    rank: Number(rank),
    matchesWon: Number(matchesWon)
  };

  players.push(newPlayer);
  await writePlayersFile(players);

  return newPlayer;
};