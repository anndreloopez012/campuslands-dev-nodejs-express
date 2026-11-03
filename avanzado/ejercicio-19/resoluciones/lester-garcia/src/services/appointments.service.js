import * as repo from "../repositories/appointments.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const auditTrail = [];

export const appendAuditRecord = ({ actor, action, resourceId, snapshot }) => {
  const record = Object.freeze({
    auditId: `AUD-0${auditTrail.length + 1}`,
    actor: actor || "tattoo-studio-admin",
    action,
    resourceId,
    snapshot,
    recordedAt: new Date().toISOString()
  });
  auditTrail.push(record);
  return record;
};

export const listItemsService = async () => ({
  appointments: await repo.findAll(),
  auditTrail: [...auditTrail]
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La cita de tatuaje '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.client || !payload.artist || !payload.sterilizationCode) {
    throw new BadRequestError("Se requiere 'client', 'artist' y 'sterilizationCode' para auditar la cita.");
  }
  const all = await repo.findAll();
  const saved = await repo.save({
    id: `TAT-0${all.length + 1}`,
    client: payload.client.trim(),
    artist: payload.artist.trim(),
    style: payload.style || "Blackwork",
    sterilizationCode: payload.sterilizationCode.trim().toUpperCase()
  });
  appendAuditRecord({
    actor: payload.actor || payload.artist,
    action: "CREATE_TATTOO_APPOINTMENT",
    resourceId: saved.id,
    snapshot: saved
  });
  return saved;
};
