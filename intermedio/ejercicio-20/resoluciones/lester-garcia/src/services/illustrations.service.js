import * as illustrationsRepo from "../repositories/illustrations.inMemory.repository.js";
import { corsConfig } from "../config/cors.config.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getCorsPolicyService = () => {
  return {
    allowedOrigins: corsConfig.allowedOrigins,
    allowedMethods: corsConfig.allowedMethods,
    allowedHeaders: corsConfig.allowedHeaders,
    allowCredentials: corsConfig.allowCredentials,
    maxAgeSeconds: corsConfig.maxAgeSeconds
  };
};

export const getAllIllustrationsService = async () => {
  return await illustrationsRepo.findAllIllustrations();
};

export const getIllustrationByIdService = async (id) => {
  const illustration = await illustrationsRepo.findIllustrationById(id);
  if (!illustration) {
    throw new NotFoundError(`La ilustración digital con ID '${id}' no existe en la galería.`);
  }
  return illustration;
};

export const createIllustrationService = async (payload) => {
  const all = await illustrationsRepo.findAllIllustrations();
  const nextId = `ART-${String(all.length + 1).padStart(2, "0")}`;

  const newIllustration = {
    id: nextId,
    title: payload.title.trim(),
    artist: payload.artist.trim(),
    software: payload.software.trim(),
    canvasResolution: payload.canvasResolution.trim(),
    layersCount: Number(payload.layersCount),
    colorProfile: payload.colorProfile.trim(),
    createdAt: new Date().toISOString()
  };

  return await illustrationsRepo.saveIllustration(newIllustration);
};
