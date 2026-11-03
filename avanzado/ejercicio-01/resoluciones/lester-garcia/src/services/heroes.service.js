import * as heroesRepo from "../repositories/heroes.inMemory.repository.js";
import { ConflictError, NotFoundError } from "../utils/customErrors.js";

/**
 * Transforma la entidad canónica al contrato plano de la versión v1 (Legacy)
 */
export const toHeroV1DTO = (hero) => ({
  id: hero.id,
  name: hero.name,
  characterClass: hero.characterClass,
  level: hero.level,
  attackPower: hero.stats.attack,
  defensePower: hero.stats.defense
});

/**
 * Transforma la entidad canónica al contrato enriquecido de la versión v2
 */
export const toHeroV2DTO = (hero) => {
  const combatRating = Math.round(
    hero.stats.attack * 1.5 +
      hero.stats.defense * 1.2 +
      hero.stats.mana * 0.4 +
      hero.level * 10
  );

  return {
    id: hero.id,
    name: hero.name,
    characterClass: hero.characterClass,
    level: hero.level,
    guild: hero.guild,
    stats: {
      attack: hero.stats.attack,
      defense: hero.stats.defense,
      mana: hero.stats.mana,
      critRate: hero.stats.critRate
    },
    combatRating,
    createdAt: hero.createdAt
  };
};

export const listHeroesV1Service = async (filters = {}) => {
  let heroes = await heroesRepo.findAll();

  if (filters.characterClass) {
    heroes = heroes.filter(
      (h) => h.characterClass.toLowerCase() === String(filters.characterClass).toLowerCase()
    );
  }

  return heroes.map(toHeroV1DTO);
};

export const getHeroByIdV1Service = async (id) => {
  const hero = await heroesRepo.findById(id);
  if (!hero) {
    throw new NotFoundError(`El héroe con ID '${id}' no fue encontrado en el registro v1.`);
  }
  return toHeroV1DTO(hero);
};

export const createHeroV1Service = async (payload) => {
  const existing = await heroesRepo.findByName(payload.name);
  if (existing) {
    throw new ConflictError(`El héroe '${payload.name}' ya existe en el gremio.`);
  }

  const all = await heroesRepo.findAll();
  const nextNumber = String(all.length + 1).padStart(2, "0");

  const canonicalHero = {
    id: `HERO-${nextNumber}`,
    name: payload.name.trim(),
    characterClass: payload.characterClass,
    level: Number(payload.level),
    guild: "Sin Gremio (Creado vía API v1)",
    stats: {
      attack: Number(payload.attackPower),
      defense: Number(payload.defensePower),
      mana: 100,
      critRate: 10
    },
    createdAt: new Date().toISOString()
  };

  const saved = await heroesRepo.save(canonicalHero);
  return toHeroV1DTO(saved);
};

export const listHeroesV2Service = async (filters = {}) => {
  let heroes = await heroesRepo.findAll();

  if (filters.characterClass) {
    heroes = heroes.filter(
      (h) => h.characterClass.toLowerCase() === String(filters.characterClass).toLowerCase()
    );
  }

  if (filters.minLevel !== undefined && !Number.isNaN(Number(filters.minLevel))) {
    heroes = heroes.filter((h) => h.level >= Number(filters.minLevel));
  }

  return heroes.map(toHeroV2DTO);
};

export const getHeroByIdV2Service = async (id) => {
  const hero = await heroesRepo.findById(id);
  if (!hero) {
    throw new NotFoundError(`El héroe con ID '${id}' no fue encontrado en el registro v2.`);
  }
  return toHeroV2DTO(hero);
};

export const createHeroV2Service = async (payload) => {
  const existing = await heroesRepo.findByName(payload.name);
  if (existing) {
    throw new ConflictError(`El héroe '${payload.name}' ya existe en el gremio.`);
  }

  const all = await heroesRepo.findAll();
  const nextNumber = String(all.length + 1).padStart(2, "0");

  const canonicalHero = {
    id: `HERO-${nextNumber}`,
    name: payload.name.trim(),
    characterClass: payload.characterClass,
    level: Number(payload.level),
    guild: payload.guild.trim(),
    stats: {
      attack: Number(payload.stats.attack),
      defense: Number(payload.stats.defense),
      mana: Number(payload.stats.mana),
      critRate: payload.stats.critRate !== undefined ? Number(payload.stats.critRate) : 15
    },
    createdAt: new Date().toISOString()
  };

  const saved = await heroesRepo.save(canonicalHero);
  return toHeroV2DTO(saved);
};
