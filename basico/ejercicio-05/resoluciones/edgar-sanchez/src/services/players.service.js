import { readFile } from "node:fs/promises";

const PLAYERS_URL = new URL("../data/players.json", import.meta.url);

async function getPlayerById(id) {
  const playerId = Number(id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new Error("El id debe ser un entero positivo");
  }

  const players = JSON.parse(await readFile(PLAYERS_URL, "utf8"));
  const player = players.find((item) => item.id === playerId);

  if (!player) {
    throw new Error(`No existe un jugador con id ${playerId}`);
  }

  return player;
}

export { getPlayerById };