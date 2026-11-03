import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/characters.json");

const readCharactersFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeCharactersFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllCharactersService = async (filters = {}) => {
  let characters = await readCharactersFile();
  const { characterClass, isAlive, minLevel } = filters;

  if (characterClass) {
    characters = characters.filter(
      (c) => c.characterClass.toLowerCase() === characterClass.toLowerCase()
    );
  }

  if (isAlive !== undefined) {
    const aliveBool = isAlive === "true";
    characters = characters.filter((c) => c.isAlive === aliveBool);
  }

  if (minLevel) {
    const lvl = Number(minLevel);
    characters = characters.filter((c) => c.level >= lvl);
  }

  return characters;
};

export const getCharacterByIdService = async (id) => {
  const characters = await readCharactersFile();
  const character = characters.find((c) => c.id === String(id));

  if (!character) {
    throw new NotFoundError(`El personaje con ID '${id}' no existe en la base de datos del RPG.`);
  }

  return character;
};

export const createCharacterService = async ({
  name,
  characterClass,
  level,
  healthPoints,
  manaPoints,
  isAlive,
  guild
}) => {
  const characters = await readCharactersFile();

  const nameExists = characters.some(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );

  if (nameExists) {
    throw new ConflictError(`El héroe '${name}' ya existe en el reino.`);
  }

  const newCharacter = {
    id: String(Date.now()),
    name,
    characterClass,
    level: Number(level),
    healthPoints: Number(healthPoints),
    manaPoints: Number(manaPoints),
    isAlive: isAlive !== undefined ? Boolean(isAlive) : true,
    guild: guild || "Sin Gremio"
  };

  characters.push(newCharacter);
  await writeCharactersFile(characters);

  return newCharacter;
};

export const updateCharacterService = async (
  id,
  { name, characterClass, level, healthPoints, manaPoints, isAlive, guild }
) => {
  const characters = await readCharactersFile();
  const index = characters.findIndex((c) => c.id === String(id));

  if (index === -1) {
    throw new NotFoundError(`No se puede actualizar. El personaje con ID '${id}' no fue encontrado.`);
  }

  const nameConflict = characters.some(
    (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== String(id)
  );

  if (nameConflict) {
    throw new ConflictError(`El nombre '${name}' ya pertenece a otro personaje.`);
  }

  const updatedCharacter = {
    id: String(id),
    name,
    characterClass,
    level: Number(level),
    healthPoints: Number(healthPoints),
    manaPoints: Number(manaPoints),
    isAlive: Boolean(isAlive),
    guild: guild || "Sin Gremio"
  };

  characters[index] = updatedCharacter;
  await writeCharactersFile(characters);

  return updatedCharacter;
};

export const deleteCharacterService = async (id) => {
  const characters = await readCharactersFile();
  const index = characters.findIndex((c) => c.id === String(id));

  if (index === -1) {
    throw new NotFoundError(`No se puede eliminar. El personaje con ID '${id}' no existe.`);
  }

  characters.splice(index, 1);
  await writeCharactersFile(characters);
};