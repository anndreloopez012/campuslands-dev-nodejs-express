import * as rpgService from "../services/rpgClass.service.js";
import { BadRequestError, UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_ATTRIBUTES = ["Fuerza", "Inteligencia", "Agilidad", "Destreza", "Vitalidad"];
const VALID_ARMORS = ["Tela", "Cuero", "Malla", "Placas"];

export const getAllClassesController = asyncHandler(async (req, res) => {
  const { attribute, isActive } = req.query;

  const classes = await rpgService.getAllClassesService({ attribute, isActive });

  return res.status(200).json({
    status: "success",
    total: classes.length,
    data: classes
  });
});

export const getClassByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rpgClass = await rpgService.getClassByIdService(id);

  return res.status(200).json({
    status: "success",
    data: rpgClass
  });
});

export const createClassController = asyncHandler(async (req, res) => {
  const authHeader = req.headers["x-realm-key"];
  if (!authHeader || authHeader !== process.env.RPG_MASTER_KEY) {
    throw new UnauthorizedError("Se requiere la llave maestra del reino en el header 'x-realm-key'.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { className, primaryAttribute, armorType, baseHealth, baseMana, isActive } = req.body;

  if (!className || typeof className !== "string" || className.trim() === "") {
    throw new BadRequestError("El campo 'className' es obligatorio.");
  }

  if (!primaryAttribute || !VALID_ATTRIBUTES.includes(primaryAttribute.trim())) {
    throw new BadRequestError(`El atributo primario debe ser uno de: ${VALID_ATTRIBUTES.join(", ")}.`);
  }

  if (!armorType || !VALID_ARMORS.includes(armorType.trim())) {
    throw new BadRequestError(`El tipo de armadura debe ser uno de: ${VALID_ARMORS.join(", ")}.`);
  }

  const hp = Number(baseHealth);
  if (baseHealth === undefined || isNaN(hp) || hp <= 0) {
    throw new BadRequestError("El campo 'baseHealth' debe ser un número positivo.");
  }

  const mp = Number(baseMana);
  if (baseMana === undefined || isNaN(mp) || mp < 0) {
    throw new BadRequestError("El campo 'baseMana' debe ser un número positivo o cero.");
  }

  const newClass = await rpgService.createClassService({
    className: className.trim(),
    primaryAttribute: primaryAttribute.trim(),
    armorType: armorType.trim(),
    baseHealth: hp,
    baseMana: mp,
    isActive
  });

  return res.status(201).json({
    status: "success",
    data: newClass
  });
});

export const updateClassController = asyncHandler(async (req, res) => {
  const authHeader = req.headers["x-realm-key"];
  if (!authHeader || authHeader !== process.env.RPG_MASTER_KEY) {
    throw new UnauthorizedError("Se requiere autorización para modificar clases en el reino.");
  }

  const { id } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { className, primaryAttribute, armorType, baseHealth, baseMana, isActive } = req.body;

  const updated = await rpgService.updateClassService(id, {
    className: className ? className.trim() : undefined,
    primaryAttribute,
    armorType,
    baseHealth,
    baseMana,
    isActive
  });

  return res.status(200).json({
    status: "success",
    data: updated
  });
});

export const deleteClassController = asyncHandler(async (req, res) => {
  const authHeader = req.headers["x-realm-key"];
  if (!authHeader || authHeader !== process.env.RPG_MASTER_KEY) {
    throw new UnauthorizedError("Se requiere autorización para eliminar clases del reino.");
  }

  const { id } = req.params;
  await rpgService.deleteClassService(id);

  return res.status(204).send();
});