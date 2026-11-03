import * as tracksRepo from "../repositories/tracks.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

// Función de normalización: remueve diacríticos/acentos y convierte a minúsculas
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const searchTracksService = async (query = {}) => {
  const allTracks = await tracksRepo.findAllTracks();
  const { q, genre, minBpm, maxBpm } = query;

  // 1. Preparar tokens de búsqueda si existe el parámetro 'q'
  const searchTokens = q ? normalizeText(q).split(/\s+/).filter(Boolean) : [];

  let results = allTracks.filter((track) => {
    // A) Filtro Textual Multi-Campo
    if (searchTokens.length > 0) {
      // Creamos una cadena consolidada con los campos buscables del registro
      const searchableCorpus = normalizeText(
        `${track.title} ${track.artist} ${track.album} ${track.genre}`
      );

      // Cada token de búsqueda debe estar presente en el corpus (AND semántico)
      const matchesAllTokens = searchTokens.every((token) => searchableCorpus.includes(token));
      if (!matchesAllTokens) return false;
    }

    // B) Filtros adicionales estructurados
    if (genre && normalizeText(track.genre) !== normalizeText(genre)) {
      return false;
    }

    if (minBpm !== undefined && track.bpm < Number(minBpm)) {
      return false;
    }

    if (maxBpm !== undefined && track.bpm > Number(maxBpm)) {
      return false;
    }

    return true;
  });

  // 2. Paginación de los resultados de búsqueda
  const totalItems = results.length;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 5));
  const skip = (page - 1) * limit;

  const paginatedTracks = results.slice(skip, skip + limit);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    tracks: paginatedTracks,
    searchMeta: {
      query: q || null,
      tokensUsed: searchTokens,
      filtersApplied: {
        genre: genre || null,
        minBpm: minBpm ? Number(minBpm) : null,
        maxBpm: maxBpm ? Number(maxBpm) : null
      }
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

export const getTrackByIdService = async (id) => {
  const track = await tracksRepo.findTrackById(id);
  if (!track) {
    throw new NotFoundError(`La pista con ID '${id}' no existe en el catálogo musical.`);
  }
  return track;
};