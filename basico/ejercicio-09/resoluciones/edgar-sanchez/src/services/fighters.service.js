import { readFile, writeFile } from "node:fs/promises";

const DATA_URL = new URL("../data/fighters.json", import.meta.url);

async function listFighters() {
  return JSON.parse(await readFile(DATA_URL, "utf8"));
}

async function addFighter({ name, weight }) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("El nombre del peleador es obligatorio");
  }

  const numericWeight = Number(weight);
  if (weight === undefined || !Number.isFinite(numericWeight) || numericWeight <= 0) {
    throw new Error("El peso debe ser un numero mayor que 0");
  }

  const fighters = await listFighters();
  const fighter = {
    id: fighters.length ? Math.max(...fighters.map((item) => item.id)) + 1 : 1,
    name: name.trim(),
    weight: numericWeight,
  };

  fighters.push(fighter);
  await writeFile(DATA_URL, JSON.stringify(fighters, null, 2));
  return fighter;
}

export { addFighter, listFighters };
