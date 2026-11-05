import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "fighters.json");

async function readFighters() {
  const data = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeFighters(fighters) {
  await writeFile(DATA_PATH, JSON.stringify(fighters, null, 2), "utf-8");
}

export async function listFighters() {
  const fighters = await readFighters();
  return fighters;
}

export async function addFighter(name, weight) {
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("El nombre del peleador es obligatorio y debe ser texto.");
  }

  const parsedWeight = Number(weight);
  if (isNaN(parsedWeight) || parsedWeight <= 0) {
    throw new Error("El peso debe ser un número mayor a 0.");
  }

  const fighters = await readFighters();
  const maxId = fighters.reduce((max, f) => (f.id > max ? f.id : max), 0);

  const newFighter = {
    id: maxId + 1,
    name: name.trim(),
    weight: parsedWeight,
    wins: 0,
    losses: 0,
    ko: 0,
  };

  fighters.push(newFighter);
  await writeFighters(fighters);
  return newFighter;
}
