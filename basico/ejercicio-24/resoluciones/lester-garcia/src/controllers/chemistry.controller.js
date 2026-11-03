import {
  getAllCompoundsService,
  getCompoundByIdService,
  createCompoundService,
  updateCompoundService,
  deleteCompoundService
} from "../services/chemistry.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_STATES = ["Sólido", "Líquido", "Gaseoso", "Plasma"];
const VALID_HAZARD_LEVELS = ["Ninguno", "Bajo", "Moderado", "Alto", "Extremo"];

export const getAllCompoundsController = asyncHandler(async (req, res) => {
  const { isHazardous, stateOfMatter, hazardLevel } = req.query;

  const compounds = await getAllCompoundsService({
    isHazardous,
    stateOfMatter,
    hazardLevel
  });

  return res.status(200).json({
    status: "success",
    total: compounds.length,
    data: compounds
  });
});

export const getCompoundByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const compound = await getCompoundByIdService(id);

  return res.status(200).json({
    status: "success",
    data: compound
  });
});

export const createCompoundController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { formula, commonName, iupacName, molarMassGmol, hazardLevel, stateOfMatter, isHazardous } = req.body;

  if (!formula || typeof formula !== "string" || formula.trim() === "") {
    throw new BadRequestError("El campo 'formula' es obligatorio.");
  }

  if (!commonName || typeof commonName !== "string" || commonName.trim() === "") {
    throw new BadRequestError("El campo 'commonName' es obligatorio.");
  }

  if (!iupacName || typeof iupacName !== "string" || iupacName.trim() === "") {
    throw new BadRequestError("El campo 'iupacName' es obligatorio.");
  }

  const mass = Number(molarMassGmol);
  if (molarMassGmol === undefined || isNaN(mass) || mass <= 0) {
    throw new BadRequestError("El campo 'molarMassGmol' debe ser un número positivo.");
  }

  if (!hazardLevel || !VALID_HAZARD_LEVELS.includes(hazardLevel.trim())) {
    throw new BadRequestError(`El 'hazardLevel' debe ser uno de: ${VALID_HAZARD_LEVELS.join(", ")}.`);
  }

  if (!stateOfMatter || !VALID_STATES.includes(stateOfMatter.trim())) {
    throw new BadRequestError(`El 'stateOfMatter' debe ser uno de: ${VALID_STATES.join(", ")}.`);
  }

  const newCompound = await createCompoundService({
    formula: formula.trim(),
    commonName: commonName.trim(),
    iupacName: iupacName.trim(),
    molarMassGmol: mass,
    hazardLevel: hazardLevel.trim(),
    stateOfMatter: stateOfMatter.trim(),
    isHazardous
  });

  return res.status(201).json({
    status: "success",
    data: newCompound
  });
});

export const updateCompoundController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición para actualización no puede estar vacío.");
  }

  const { formula, commonName, iupacName, molarMassGmol, hazardLevel, stateOfMatter, isHazardous } = req.body;

  if (!formula || typeof formula !== "string" || formula.trim() === "") {
    throw new BadRequestError("El campo 'formula' es obligatorio.");
  }

  if (!commonName || typeof commonName !== "string" || commonName.trim() === "") {
    throw new BadRequestError("El campo 'commonName' es obligatorio.");
  }

  if (!iupacName || typeof iupacName !== "string" || iupacName.trim() === "") {
    throw new BadRequestError("El campo 'iupacName' es obligatorio.");
  }

  const mass = Number(molarMassGmol);
  if (molarMassGmol === undefined || isNaN(mass) || mass <= 0) {
    throw new BadRequestError("El campo 'molarMassGmol' debe ser un número positivo.");
  }

  if (!hazardLevel || !VALID_HAZARD_LEVELS.includes(hazardLevel.trim())) {
    throw new BadRequestError(`El 'hazardLevel' debe ser uno de: ${VALID_HAZARD_LEVELS.join(", ")}.`);
  }

  if (!stateOfMatter || !VALID_STATES.includes(stateOfMatter.trim())) {
    throw new BadRequestError(`El 'stateOfMatter' debe ser uno de: ${VALID_STATES.join(", ")}.`);
  }

  const updatedCompound = await updateCompoundService(id, {
    formula: formula.trim(),
    commonName: commonName.trim(),
    iupacName: iupacName.trim(),
    molarMassGmol: mass,
    hazardLevel: hazardLevel.trim(),
    stateOfMatter: stateOfMatter.trim(),
    isHazardous
  });

  return res.status(200).json({
    status: "success",
    data: updatedCompound
  });
});

export const deleteCompoundController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteCompoundService(id);

  // Respuesta estándar 204 No Content para eliminaciones exitosas sin cuerpo
  return res.status(204).send();
});