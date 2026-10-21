import * as planetsRepo from "../repositories/planets.inMemory.repository.js";
import * as starshipsRepo from "../repositories/starships.inMemory.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllPlanetsService = async () => {
  return await planetsRepo.findAllPlanets();
};

export const getPlanetByIdService = async (id) => {
  const planet = await planetsRepo.findPlanetById(id);
  if (!planet) {
    throw new NotFoundError(`El planeta con ID '${id}' no existe en el atlas estelar.`);
  }
  return planet;
};

export const deletePlanetService = async (id) => {
  await getPlanetByIdService(id);

  // Integridad Referencial: Verificar si existen naves que referencien este planeta
  const dependentShips = await starshipsRepo.findStarshipsByPlanetId(id);
  if (dependentShips.length > 0) {
    throw new ConflictError(
      `No se puede eliminar el planeta '${id}' porque tiene ${dependentShips.length} naves espaciales asignadas como base.`
    );
  }

  await planetsRepo.deletePlanet(id);
};