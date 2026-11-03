import * as repo from "../repositories/jumps.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const ROLE_PERMISSIONS = {
  STUDENT: ["TANDEM"],
  INSTRUCTOR: ["TANDEM", "AFF_SUPERVISED"],
  SAFETY_DIRECTOR: ["TANDEM", "AFF_SUPERVISED", "HALO_SOLO", "WINGSUIT"]
};

export const listItemsService = async () => ({
  roleMatrix: ROLE_PERMISSIONS,
  jumps: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El manifiesto de salto '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  const { jumperName, jumpType, altitudeFeet, role } = payload || {};
  const userRole = String(role || "STUDENT").toUpperCase();
  const allowedTypes = ROLE_PERMISSIONS[userRole];

  if (!allowedTypes) {
    throw new BadRequestError(`El rol '${userRole}' no es reconocido. Usa STUDENT, INSTRUCTOR o SAFETY_DIRECTOR.`);
  }
  if (!jumperName || !jumpType) {
    throw new BadRequestError("Se requiere 'jumperName' y 'jumpType'.");
  }
  if (!allowedTypes.includes(jumpType)) {
    const err = new AppError(
      `Acceso denegado (403): El rol '${userRole}' no tiene permiso para autorizar saltos de tipo '${jumpType}'.`,
      403
    );
    throw err;
  }

  const all = await repo.findAll();
  return repo.save({
    id: `JMP-0${all.length + 1}`,
    jumperName: jumperName.trim(),
    jumpType,
    altitudeFeet: Number(altitudeFeet || 13000),
    authorizedByRole: userRole
  });
};
