import { config } from "../config/env.config.js";
import * as tattoosRepo from "../repositories/tattoos.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

const enrichWithPricing = (session) => {
  const { hourlyRateUsd, depositPercentage, name } = config.studio;
  const totalCostUsd = Number((session.estimatedHours * hourlyRateUsd).toFixed(2));
  const requiredDepositUsd = Number(((totalCostUsd * depositPercentage) / 100).toFixed(2));

  return {
    ...session,
    studioName: name,
    pricing: {
      hourlyRateUsd,
      depositPercentage,
      totalCostUsd,
      requiredDepositUsd
    }
  };
};

export const getStudioConfigService = () => {
  return {
    studio: config.studio.name,
    environment: config.server.nodeEnv,
    apiVersion: config.server.apiVersion,
    parameters: {
      hourlyRateUsd: config.studio.hourlyRateUsd,
      depositPercentage: config.studio.depositPercentage,
      minAgeRequired: config.studio.minAgeRequired,
      maxSessionHours: config.studio.maxSessionHours,
      allowedStyles: config.studio.allowedStyles
    }
  };
};

export const getAllTattoosService = async () => {
  const sessions = await tattoosRepo.findAllTattoos();
  return sessions.map(enrichWithPricing);
};

export const getTattooByIdService = async (id) => {
  const session = await tattoosRepo.findTattooById(id);
  if (!session) {
    throw new NotFoundError(`La sesión de tatuaje con ID '${id}' no fue encontrada.`);
  }
  return enrichWithPricing(session);
};

export const createTattooService = async (payload) => {
  const all = await tattoosRepo.findAllTattoos();
  const nextNumber = String(all.length + 1).padStart(2, "0");

  const newSession = {
    id: `TAT-${nextNumber}`,
    clientName: payload.clientName.trim(),
    clientAge: Number(payload.clientAge),
    tattooStyle: payload.tattooStyle.trim(),
    bodyPlacement: payload.bodyPlacement.trim(),
    artistName: payload.artistName.trim(),
    estimatedHours: Number(payload.estimatedHours),
    createdAt: new Date().toISOString()
  };

  const saved = await tattoosRepo.saveTattoo(newSession);
  return enrichWithPricing(saved);
};
