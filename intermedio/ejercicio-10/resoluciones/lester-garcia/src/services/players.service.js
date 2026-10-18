import * as playersRepo from "../repositories/players.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getPlayersService = async (query = {}) => {
  const allPlayers = await playersRepo.findAllPlayers();

  // 1. Filtrado dinámico
  const { gripStyle, country, hand, search } = query;
  let filtered = allPlayers.filter((p) => {
    if (gripStyle && p.gripStyle.toLowerCase() !== gripStyle.toLowerCase()) return false;
    if (country && p.country.toLowerCase() !== country.toLowerCase()) return false;
    if (hand && p.hand.toLowerCase() !== hand.toLowerCase()) return false;
    if (search) {
      const term = search.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(term);
      const matchesCountry = p.country.toLowerCase().includes(term);
      if (!matchesName && !matchesCountry) return false;
    }
    return true;
  });

  // 2. Lógica de Ordenamiento Dinámico
  const sortBy = query.sortBy || "rankingPoints";
  const order = (query.order && query.order.toLowerCase() === "asc") ? "asc" : "desc";
  const modifier = order === "asc" ? 1 : -1;

  filtered.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    // Ordenamiento alfanumérico para strings
    if (typeof valA === "string" && typeof valB === "string") {
      return valA.localeCompare(valB) * modifier;
    }

    // Ordenamiento numérico
    return (Number(valA) - Number(valB)) * modifier;
  });

  // 3. Paginación de resultados ya ordenados
  const totalItems = filtered.length;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 5));
  const skip = (page - 1) * limit;

  const paginatedPlayers = filtered.slice(skip, skip + limit);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    players: paginatedPlayers,
    sortApplied: {
      field: sortBy,
      direction: order
    },
    pagination: {
      currentPage: page,
      perPage: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

export const getPlayerByIdService = async (id) => {
  const player = await playersRepo.findPlayerById(id);
  if (!player) {
    throw new NotFoundError(`El jugador con ID '${id}' no existe en la federación.`);
  }
  return player;
};