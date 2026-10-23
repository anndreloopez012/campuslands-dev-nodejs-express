import { readFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/players.json", import.meta.url);

async function getPlayerById(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("El id del jugador debe ser un entero positivo");
  }

  const raw = await readFile(DATA_PATH, "utf-8");
  const players = JSON.parse(raw);

  const player = players.find((p) => p.id === numericId);
  if (!player) {
    throw new Error(`Jugador con id ${numericId} no encontrado`);
  }

  return player;
}

export { getPlayerById };
