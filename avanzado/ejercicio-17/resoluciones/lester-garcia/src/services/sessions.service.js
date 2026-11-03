import * as repo from "../repositories/sessions.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
import crypto from "node:crypto";

export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La sesión de viajero '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  // Permite iniciar sesión o rotar un refreshToken existente
  if (payload.refreshTokenToRotate) {
    const all = await repo.findAll();
    const session = all.find((s) => s.refreshToken === payload.refreshTokenToRotate);
    if (!session || session.revoked) {
      throw new BadRequestError("Refresh Token inválido, expirado o previamente revocado.");
    }
    session.refreshToken = `rt_${crypto.randomBytes(6).toString("hex")}`;
    session.rotatedCount += 1;
    return {
      action: "TOKEN_ROTATED",
      accessToken: `at_${crypto.randomBytes(8).toString("hex")}`,
      newRefreshToken: session.refreshToken,
      session
    };
  }

  if (!payload.traveler || !payload.destination) {
    throw new BadRequestError("Envía 'traveler' y 'destination' para emitir tokens o 'refreshTokenToRotate'.");
  }
  const all = await repo.findAll();
  const newSession = await repo.save({
    id: `SES-0${all.length + 1}`,
    traveler: payload.traveler.trim(),
    destination: payload.destination.trim(),
    refreshToken: `rt_${crypto.randomBytes(6).toString("hex")}`,
    rotatedCount: 0,
    revoked: false
  });
  return {
    action: "SESSION_ISSUED",
    accessToken: `at_${crypto.randomBytes(8).toString("hex")}`,
    refreshToken: newSession.refreshToken,
    session: newSession
  };
};
