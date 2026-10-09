import {
  getAllCharactersService,
  getCharacterByIdService,
  createCharacterService,
  updateCharacterService,
  deleteCharacterService
} from "../services/rpg.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_CLASSES = ["Mago", "Guerrero", "Pícaro", "Clérigo", "Paladín", "Cazador"];

export const getAllCharactersController = asyncHandler(async (req, res) => {
  const { characterClass, isAlive, minLevel } = req.query;

  if (minLevel !== undefined && (isNaN(Number(minLevel)) || Number(minLevel) < 1)) {
    throw new BadRequestError("El parámetro 'minLevel' debe ser un número entero mayor o igual a 1.");
  }

  const characters = await getAllCharactersService({ characterClass, isAlive, minLevel });

  // 200 OK para lectura exitosa de listas
  return res.status(200).json({
    status: "success",
    results: characters.length,
    data: characters
  });
});

export const getCharacterByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const character = await getCharacterByIdService(id);

  // 200 OK para obtención exitosa por ID
  return res.status(200).json({
    status: "success",
    data: character
  });
});

export const createCharacterController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { name, characterClass, level, healthPoints, manaPoints, isAlive, guild } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError("El campo 'name' es obligatorio.");
  }

  if (!characterClass || !VALID_CLASSES.includes(characterClass.trim())) {
    throw new BadRequestError(`El campo 'characterClass' debe ser una de las clases permitidas: ${VALID_CLASSES.join(", ")}.`);
  }

  const lvl = Number(level);
  if (level === undefined || isNaN(lvl) || lvl < 1 || lvl > 100) {
    throw new BadRequestError("El campo 'level' debe ser un número entre 1 y 100.");
  }

  const hp = Number(healthPoints);
  if (healthPoints === undefined || isNaN(hp) || hp < 0) {
    throw new BadRequestError("El campo 'healthPoints' debe ser un número positivo mayor o igual a 0.");
  }

  const mp = Number(manaPoints);
  if (manaPoints === undefined || isNaN(mp) || mp < 0) {
    throw new BadRequestError("El campo 'manaPoints' debe ser un número positivo mayor o igual a 0.");
  }

  const newCharacter = await createCharacterService({
    name: name.trim(),
    characterClass: characterClass.trim(),
    level: lvl,
    healthPoints: hp,
    manaPoints: mp,
    isAlive,
    guild: guild ? guild.trim() : "Sin Gremio"
  });

  // 201 Created para creación exitosa de un recurso
  return res.status(201).json({
    status: "success",
    data: newCharacter
  });
});

export const updateCharacterController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { name, characterClass, level, healthPoints, manaPoints, isAlive, guild } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError("El campo 'name' es obligatorio.");
  }

  if (!characterClass || !VALID_CLASSES.includes(characterClass.trim())) {
    throw new BadRequestError(`El campo 'characterClass' debe ser una de las clases permitidas: ${VALID_CLASSES.join(", ")}.`);
  }

  const lvl = Number(level);
  if (level === undefined || isNaN(lvl) || lvl < 1 || lvl > 100) {
    throw new BadRequestError("El campo 'level' debe ser un número entre 1 y 100.");
  }

  const hp = Number(healthPoints);
  if (healthPoints === undefined || isNaN(hp) || hp < 0) {
    throw new BadRequestError("El campo 'healthPoints' debe ser un número mayor o igual a 0.");
  }

  const mp = Number(manaPoints);
  if (manaPoints === undefined || isNaN(mp) || mp < 0) {
    throw new BadRequestError("El campo 'manaPoints' debe ser un número mayor o igual a 0.");
  }

  const updatedCharacter = await updateCharacterService(id, {
    name: name.trim(),
    characterClass: characterClass.trim(),
    level: lvl,
    healthPoints: hp,
    manaPoints: mp,
    isAlive,
    guild: guild ? guild.trim() : "Sin Gremio"
  });

  // 200 OK para actualización completa exitosa
  return res.status(200).json({
    status: "success",
    data: updatedCharacter
  });
});

export const deleteCharacterController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteCharacterService(id);

  // 204 No Content para eliminación exitosa sin cuerpo de respuesta
  return res.status(204).send();
});