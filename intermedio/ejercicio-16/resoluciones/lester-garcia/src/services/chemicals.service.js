import * as chemicalRepo from "../repositories/chemicals.inMemory.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllChemicalsService = async (hazardLevel) => {
  let list = await chemicalRepo.findAllChemicals();
  if (hazardLevel) {
    list = list.filter((c) => c.hazardLevel.toLowerCase() === hazardLevel.toLowerCase());
  }
  return list;
};

export const getChemicalByIdService = async (id) => {
  const compound = await chemicalRepo.findChemicalById(id);
  if (!compound) {
    throw new NotFoundError(`El compuesto químico con ID '${id}' no existe en el registro.`);
  }
  return compound;
};

export const createChemicalService = async (payload, currentUser) => {
  const existing = await chemicalRepo.findChemicalByCode(payload.formulaCode);
  if (existing) {
    throw new ConflictError(`El código de fórmula '${payload.formulaCode}' ya se encuentra registrado.`);
  }

  const newCompound = {
    id: String(Date.now()),
    formulaCode: payload.formulaCode.trim().toUpperCase(),
    compoundName: payload.compoundName.trim(),
    molecularFormula: payload.molecularFormula.trim(),
    hazardLevel: payload.hazardLevel.trim(),
    purityPercentage: Number(payload.purityPercentage),
    storageTempCelsius: Number(payload.storageTempCelsius),
    createdById: currentUser.id
  };

  return await chemicalRepo.saveChemical(newCompound);
};

export const deleteChemicalService = async (id) => {
  const compound = await chemicalRepo.findChemicalById(id);
  if (!compound) {
    throw new NotFoundError(`No se puede eliminar. Compuesto con ID '${id}' no encontrado.`);
  }

  await chemicalRepo.deleteChemical(id);
};