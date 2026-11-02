import * as starshipsRepo from "../repositories/starships.inMemory.repository.js";
import { getPlanetByIdService } from "./planets.service.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllStarshipsService = async (query = {}) => {
  const { planetId, shipClass, embed } = query;
  let ships = await starshipsRepo.findAllStarships();

  if (planetId) {
    ships = ships.filter((s) => s.homePlanetId === String(planetId));
  }

  if (shipClass) {
    ships = ships.filter((s) => s.shipClass.toLowerCase() === shipClass.toLowerCase());
  }

  // Soporte para poblar/incrustar la relación (Eager loading simple)
  if (embed === "planet") {
    ships = await Promise.all(
      ships.map(async (ship) => {
        const planet = await getPlanetByIdService(ship.homePlanetId);
        return {
          ...ship,
          homePlanet: planet
        };
      })
    );
  }

  return ships;
};

export const getStarshipByIdService = async (id, embedPlanet = false) => {
  const ship = await starshipsRepo.findStarshipById(id);
  if (!ship) {
    throw new NotFoundError(`La nave estelar con ID '${id}' no existe.`);
  }

  if (embedPlanet) {
    const planet = await getPlanetByIdService(ship.homePlanetId);
    return {
      ...ship,
      homePlanet: planet
    };
  }

  return ship;
};

export const createStarshipService = async (payload) => {
  // 1. Integridad Referencial: Comprobar que el homePlanetId existe realmente
  await getPlanetByIdService(payload.homePlanetId);

  // 2. Unicidad del código de registro
  const existing = await starshipsRepo.findStarshipByRegistry(payload.registryCode);
  if (existing) {
    throw new ConflictError(`El código de registro '${payload.registryCode}' ya está en servicio.`);
  }

  const newShip = {
    id: String(Date.now()),
    registryCode: payload.registryCode.trim().toUpperCase(),
    name: payload.name.trim(),
    shipClass: payload.shipClass.trim(),
    warpSpeed: Number(payload.warpSpeed),
    homePlanetId: String(payload.homePlanetId).trim(),
    isActive: true
  };

  return await starshipsRepo.saveStarship(newShip);
};

export const deleteStarshipService = async (id) => {
  const deleted = await starshipsRepo.deleteStarship(id);
  if (!deleted) {
    throw new NotFoundError(`No se puede eliminar. La nave con ID '${id}' no existe.`);
  }
};