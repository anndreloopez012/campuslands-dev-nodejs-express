import * as repo from "../repositories/telemetry.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
import { EventEmitter } from "node:events";

export const hypercarBus = new EventEmitter();
const eventLogs = [];

hypercarBus.on("hypercar:telemetry-recorded", (record) => {
  if (record.topSpeedKmh >= Number(process.env.SPEED_ALERT_KMH || 380)) {
    eventLogs.push({
      event: "AERO_ACTIVE_WING_DEPLOYED",
      hypercar: record.hypercar,
      speedKmh: record.topSpeedKmh,
      timestamp: new Date().toISOString()
    });
  }
});

export const listItemsService = async () => {
  const records = await repo.findAll();
  return { records, emittedEvents: [...eventLogs] };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El registro de telemetría '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.hypercar || payload.topSpeedKmh === undefined) {
    throw new BadRequestError("Se requiere 'hypercar' y 'topSpeedKmh'.");
  }
  const all = await repo.findAll();
  const speed = Number(payload.topSpeedKmh);
  const saved = await repo.save({
    id: `TEL-0${all.length + 1}`,
    hypercar: payload.hypercar.trim(),
    topSpeedKmh: speed,
    downforceKg: Number(payload.downforceKg || 650),
    aeroAlertTriggered: speed >= Number(process.env.SPEED_ALERT_KMH || 380)
  });
  hypercarBus.emit("hypercar:telemetry-recorded", saved);
  return saved;
};
