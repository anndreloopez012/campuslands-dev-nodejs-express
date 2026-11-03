import * as fightersRepo from "../repositories/fighters.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getFightersService = async (query = {}) => {
  // Valores por defecto
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 5));
  const skip = (page - 1) * limit;

  const { weightClass, stance, isActive, minKnockouts, search } = query;

  // Función predicado que evalúa los filtros dinámicos
  const filterFn = (f) => {
    if (weightClass && f.weightClass.toLowerCase() !== weightClass.toLowerCase()) {
      return false;
    }

    if (stance && f.stance.toLowerCase() !== stance.toLowerCase()) {
      return false;
    }

    if (isActive !== undefined) {
      const activeBool = isActive === "true";
      if (f.isActive !== activeBool) return false;
    }

    if (minKnockouts !== undefined) {
      const minKos = Number(minKnockouts);
      if (f.record.knockouts < minKos) return false;
    }

    if (search) {
      const term = search.toLowerCase();
      const matchesName = f.name.toLowerCase().includes(term);
      const matchesNickname = f.nickname.toLowerCase().includes(term);
      if (!matchesName && !matchesNickname) return false;
    }

    return true;
  };

  const { items, totalCount } = await fightersRepo.findAndPaginate({ filterFn, skip, limit });

  // Cálculo de metadatos de paginación
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    fighters: items,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
};

export const getFighterByIdService = async (id) => {
  const fighter = await fightersRepo.findById(id);
  if (!fighter) {
    throw new NotFoundError(`El peleador con ID '${id}' no existe en el roster.`);
  }
  return fighter;
};