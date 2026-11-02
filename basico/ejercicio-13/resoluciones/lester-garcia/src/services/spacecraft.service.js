import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/spacecrafts.json");

const readSpacecraftsFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeSpacecraftsFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllSpacecraftsService = async () => {
  return await readSpacecraftsFile();
};

export const getSpacecraftByIdService = async (id) => {
  const crafts = await readSpacecraftsFile();
  const craft = crafts.find((c) => c.id === String(id));

  if (!craft) {
    throw new NotFoundError(`La nave espacial con ID '${id}' no fue localizada en el radar.`);
  }

  return craft;
};

export const createSpacecraftService = async ({ name, craftClass, warpCapable, crewCapacity, status }) => {
  const crafts = await readSpacecraftsFile();

  const nameExists = crafts.some(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );

  if (nameExists) {
    throw new ConflictError(`La nave espacial '${name}' ya se encuentra registrada en el hangar.`);
  }

  const newCraft = {
    id: String(Date.now()),
    name,
    class: craftClass,
    warpCapable: Boolean(warpCapable),
    crewCapacity: Number(crewCapacity),
    status: status || "Operational"
  };

  crafts.push(newCraft);
  await writeSpacecraftsFile(crafts);

  return newCraft;
};