import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/skydive.json");

const readJumpsFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeJumpsFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllJumpsService = async () => {
  return await readJumpsFile();
};

export const getJumpByIdService = async (id) => {
  const jumps = await readJumpsFile();
  const jump = jumps.find((j) => j.id === String(id));

  if (!jump) {
    throw new NotFoundError(`El registro de salto con ID '${id}' no existe.`);
  }

  return jump;
};

export const createJumpService = async ({ jumperName, jumpType, altitudeFeet, dropzone, priceUSD, hasVideoPackage }) => {
  const jumps = await readJumpsFile();

  // Control de duplicados: mismo paracaidista en la misma dropzone y altitud
  const exists = jumps.some(
    (j) =>
      j.jumperName.toLowerCase() === jumperName.toLowerCase() &&
      j.dropzone.toLowerCase() === dropzone.toLowerCase() &&
      j.altitudeFeet === altitudeFeet
  );

  if (exists) {
    throw new ConflictError(
      `El paracaidista '${jumperName}' ya tiene un salto registrado a ${altitudeFeet} pies en '${dropzone}'.`
    );
  }

  const newJump = {
    id: String(Date.now()),
    jumperName,
    jumpType,
    altitudeFeet,
    dropzone,
    priceUSD,
    hasVideoPackage: hasVideoPackage !== undefined ? Boolean(hasVideoPackage) : false
  };

  jumps.push(newJump);
  await writeJumpsFile(jumps);

  return newJump;
};