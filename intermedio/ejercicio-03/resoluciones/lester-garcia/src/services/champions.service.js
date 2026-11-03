import * as championsRepo from "../repositories/champions.repository.js";
import { BadRequestError, NotFoundError, ConflictError } from "../utils/customErrors.js";

const VALID_ROLES = ["Mage", "Fighter", "Assassin", "Marksman", "Support", "Tank"];
const VALID_ATTACK_TYPES = ["Melee", "Ranged"];
const VALID_DIFFICULTIES = ["Low", "Moderate", "High"];

export const getAllChampionsService = async (filters = {}) => {
  let champions = await championsRepo.findAllChampions();
  const { role, isMeta, difficulty } = filters;

  if (role) {
    champions = champions.filter((c) => c.role.toLowerCase() === role.toLowerCase());
  }

  if (difficulty) {
    champions = champions.filter((c) => c.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (isMeta !== undefined) {
    const isMetaBool = isMeta === "true";
    champions = champions.filter((c) => c.isCompetitiveMeta === isMetaBool);
  }

  return champions;
};

export const getChampionByIdService = async (id) => {
  const champion = await championsRepo.findChampionById(id);
  if (!champion) {
    throw new NotFoundError(`El campeón con ID '${id}' no existe en el roster.`);
  }
  return champion;
};

export const createChampionService = async (payload) => {
  const { name, role, attackType, difficulty, winRate, pickRate, isCompetitiveMeta } = payload;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError("El campo 'name' es obligatorio.");
  }

  if (!role || !VALID_ROLES.includes(role.trim())) {
    throw new BadRequestError(`El rol debe ser uno de: ${VALID_ROLES.join(", ")}.`);
  }

  if (!attackType || !VALID_ATTACK_TYPES.includes(attackType.trim())) {
    throw new BadRequestError(`El tipo de ataque debe ser: ${VALID_ATTACK_TYPES.join(", ")}.`);
  }

  if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty.trim())) {
    throw new BadRequestError(`La dificultad debe ser: ${VALID_DIFFICULTIES.join(", ")}.`);
  }

  const wr = Number(winRate);
  if (winRate === undefined || isNaN(wr) || wr < 0 || wr > 100) {
    throw new BadRequestError("El 'winRate' debe ser un número entre 0 y 100.");
  }

  const pr = Number(pickRate);
  if (pickRate === undefined || isNaN(pr) || pr < 0 || pr > 100) {
    throw new BadRequestError("El 'pickRate' debe ser un número entre 0 y 100.");
  }

  const existing = await championsRepo.findChampionByName(name.trim());
  if (existing) {
    throw new ConflictError(`El campeón '${name}' ya se encuentra registrado.`);
  }

  const newChampion = {
    id: String(Date.now()),
    name: name.trim(),
    role: role.trim(),
    attackType: attackType.trim(),
    difficulty: difficulty.trim(),
    winRate: wr,
    pickRate: pr,
    isCompetitiveMeta: isCompetitiveMeta !== undefined ? Boolean(isCompetitiveMeta) : false
  };

  return await championsRepo.saveChampion(newChampion);
};

export const updateChampionService = async (id, payload) => {
  const champion = await championsRepo.findChampionById(id);
  if (!champion) {
    throw new NotFoundError(`No se puede actualizar. El campeón con ID '${id}' no existe.`);
  }

  const { name, role, attackType, difficulty, winRate, pickRate, isCompetitiveMeta } = payload;

  if (name) {
    const conflict = await championsRepo.findChampionByName(name.trim());
    if (conflict && conflict.id !== String(id)) {
      throw new ConflictError(`El nombre '${name}' ya está registrado en otro campeón.`);
    }
  }

  if (role && !VALID_ROLES.includes(role.trim())) {
    throw new BadRequestError(`El rol debe ser uno de: ${VALID_ROLES.join(", ")}.`);
  }

  const wr = winRate !== undefined ? Number(winRate) : champion.winRate;
  if (isNaN(wr) || wr < 0 || wr > 100) {
    throw new BadRequestError("El 'winRate' debe ser un número entre 0 y 100.");
  }

  const pr = pickRate !== undefined ? Number(pickRate) : champion.pickRate;
  if (isNaN(pr) || pr < 0 || pr > 100) {
    throw new BadRequestError("El 'pickRate' debe ser un número entre 0 y 100.");
  }

  const updateData = {
    name: name ? name.trim() : champion.name,
    role: role ? role.trim() : champion.role,
    attackType: attackType ? attackType.trim() : champion.attackType,
    difficulty: difficulty ? difficulty.trim() : champion.difficulty,
    winRate: wr,
    pickRate: pr,
    isCompetitiveMeta: isCompetitiveMeta !== undefined ? Boolean(isCompetitiveMeta) : champion.isCompetitiveMeta
  };

  return await championsRepo.updateChampionInStore(id, updateData);
};

export const deleteChampionService = async (id) => {
  const deleted = await championsRepo.deleteChampionFromStore(id);
  if (!deleted) {
    throw new NotFoundError(`No se puede eliminar. El campeón con ID '${id}' no existe.`);
  }
};