import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/compounds.json");

const readCompoundsFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeCompoundsFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

// READ All
export const getAllCompoundsService = async (filters = {}) => {
  let compounds = await readCompoundsFile();
  const { isHazardous, stateOfMatter, hazardLevel } = filters;

  if (isHazardous !== undefined) {
    const isHazardousBool = isHazardous === "true";
    compounds = compounds.filter((c) => c.isHazardous === isHazardousBool);
  }

  if (stateOfMatter) {
    compounds = compounds.filter(
      (c) => c.stateOfMatter.toLowerCase() === stateOfMatter.toLowerCase()
    );
  }

  if (hazardLevel) {
    compounds = compounds.filter(
      (c) => c.hazardLevel.toLowerCase() === hazardLevel.toLowerCase()
    );
  }

  return compounds;
};

// READ One
export const getCompoundByIdService = async (id) => {
  const compounds = await readCompoundsFile();
  const compound = compounds.find((c) => c.id === String(id));

  if (!compound) {
    throw new NotFoundError(`El compuesto químico con ID '${id}' no existe.`);
  }

  return compound;
};

// CREATE
export const createCompoundService = async ({
  formula,
  commonName,
  iupacName,
  molarMassGmol,
  hazardLevel,
  stateOfMatter,
  isHazardous
}) => {
  const compounds = await readCompoundsFile();

  const formulaExists = compounds.some(
    (c) => c.formula.toLowerCase() === formula.toLowerCase()
  );

  if (formulaExists) {
    throw new ConflictError(`El compuesto con la fórmula '${formula}' ya está registrado.`);
  }

  const newCompound = {
    id: String(Date.now()),
    formula,
    commonName,
    iupacName,
    molarMassGmol: Number(molarMassGmol),
    hazardLevel,
    stateOfMatter,
    isHazardous: isHazardous !== undefined ? Boolean(isHazardous) : false
  };

  compounds.push(newCompound);
  await writeCompoundsFile(compounds);

  return newCompound;
};

// UPDATE (PUT)
export const updateCompoundService = async (
  id,
  { formula, commonName, iupacName, molarMassGmol, hazardLevel, stateOfMatter, isHazardous }
) => {
  const compounds = await readCompoundsFile();
  const index = compounds.findIndex((c) => c.id === String(id));

  if (index === -1) {
    throw new NotFoundError(`No se puede actualizar. El compuesto con ID '${id}' no existe.`);
  }

  // Verificar conflicto de fórmula con otros registros
  const conflict = compounds.some(
    (c) => c.formula.toLowerCase() === formula.toLowerCase() && c.id !== String(id)
  );

  if (conflict) {
    throw new ConflictError(`Otra sustancia química ya utiliza la fórmula '${formula}'.`);
  }

  const updatedCompound = {
    id: String(id),
    formula,
    commonName,
    iupacName,
    molarMassGmol: Number(molarMassGmol),
    hazardLevel,
    stateOfMatter,
    isHazardous: Boolean(isHazardous)
  };

  compounds[index] = updatedCompound;
  await writeCompoundsFile(compounds);

  return updatedCompound;
};

// DELETE
export const deleteCompoundService = async (id) => {
  const compounds = await readCompoundsFile();
  const index = compounds.findIndex((c) => c.id === String(id));

  if (index === -1) {
    throw new NotFoundError(`No se puede eliminar. El compuesto con ID '${id}' no fue encontrado.`);
  }

  compounds.splice(index, 1);
  await writeCompoundsFile(compounds);
};