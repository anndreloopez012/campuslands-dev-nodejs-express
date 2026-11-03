import * as formulasRepo from "../repositories/formulas.inMemory.repository.js";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/customErrors.js";

export const classifyPhLevel = (ph) => {
  const value = Number(ph);
  if (isNaN(value) || value < 0 || value > 14) {
    throw new BadRequestError("El valor de pH debe estar estrictamente entre 0 y 14.");
  }
  if (value < 3) return "Acido_Fuerte";
  if (value < 6.5) return "Acido_Debil";
  if (value <= 7.5) return "Neutro";
  if (value <= 11) return "Base_Debil";
  return "Base_Fuerte";
};

export const calculateMolarity = ({ soluteGrams, molarMassGmol, solutionVolumeLiters }) => {
  const grams = Number(soluteGrams);
  const molarMass = Number(molarMassGmol);
  const liters = Number(solutionVolumeLiters);

  if (grams <= 0 || molarMass <= 0 || liters <= 0) {
    throw new BadRequestError("Los gramos, masa molar y litros deben ser mayores que cero.");
  }

  const moles = grams / molarMass;
  return Number((moles / liters).toFixed(2));
};

export const getAllFormulasService = async () => {
  return await formulasRepo.findAllFormulas();
};

export const getFormulaByIdService = async (id) => {
  const formula = await formulasRepo.findFormulaById(id);
  if (!formula) {
    throw new NotFoundError(`La fórmula química con ID '${id}' no fue encontrada.`);
  }
  return formula;
};

export const createFormulaService = async (payload) => {
  const existing = await formulasRepo.findFormulaByMolecular(payload.molecularFormula);
  if (existing) {
    throw new ConflictError(`La fórmula molecular '${payload.molecularFormula}' ya existe en el catálogo.`);
  }

  const acidityCategory = classifyPhLevel(payload.phLevel);
  const molarityMolL = calculateMolarity({
    soluteGrams: payload.soluteGrams,
    molarMassGmol: payload.molarMassGmol,
    solutionVolumeLiters: payload.solutionVolumeLiters
  });

  const all = await formulasRepo.findAllFormulas();
  const nextId = `CHM-${String(all.length + 1).padStart(2, "0")}`;

  const newFormula = {
    id: nextId,
    commonName: payload.commonName.trim(),
    molecularFormula: payload.molecularFormula.trim(),
    molarMassGmol: Number(payload.molarMassGmol),
    phLevel: Number(payload.phLevel),
    acidityCategory,
    molarityMolL,
    createdAt: new Date().toISOString()
  };

  return await formulasRepo.saveFormula(newFormula);
};
