import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/fighters.json", import.meta.url);

async function listFighters() {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function addFighter({ name, weight }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("El nombre del peleador es obligatorio");
  }

  const numericWeight = Number(weight);
  if (!weight || Number.isNaN(numericWeight) || numericWeight <= 0) {
    throw new Error("El peso debe ser un numero mayor a 0");
  }

  const fighters = await listFighters();
  const newFighter = {
    id: fighters.length ? Math.max(...fighters.map((f) => f.id)) + 1 : 1,
    name: name.trim(),
    weight: numericWeight,
  };

  fighters.push(newFighter);
  await writeFile(DATA_PATH, JSON.stringify(fighters, null, 2));

  return newFighter;
}

export { listFighters, addFighter };
