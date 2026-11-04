import * as repo from "../repositories/dyno-orders.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const idempotencyCache = new Map();
const auditLog = [];
const telemetryMetrics = { totalOrdersCreated: 0, idempotentHits: 0 };

export const listItemsService = async () => ({
  metrics: { ...telemetryMetrics },
  auditLog: [...auditLog],
  orders: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La orden dinamométrica '${id}' no existe en el taller.`);
  return item;
};

export const createItemService = async (payload) => {
  const idemKey = payload.idempotencyKey;
  if (idemKey && idempotencyCache.has(idemKey)) {
    telemetryMetrics.idempotentHits += 1;
    return {
      idempotentReplay: true,
      idempotencyKey: idemKey,
      order: idempotencyCache.get(idemKey)
    };
  }

  if (!payload.plate || !payload.bikeModel || payload.engineCc === undefined || payload.peakWheelHp === undefined) {
    throw new BadRequestError(
      "Se requiere 'plate', 'bikeModel', 'engineCc' y 'peakWheelHp' para certificar la prueba en banco dinamométrico."
    );
  }

  if (Number(payload.engineCc) < 125 || Number(payload.engineCc) > 2500) {
    throw new BadRequestError("El cilindraje ('engineCc') debe estar entre 125 cc y 2500 cc.");
  }

  const all = await repo.findAll();
  const baseFee = Number(process.env.DYNO_BASE_FEE_USD || 120);
  const partsCost = Number(payload.partsCostUsd || 0);

  const saved = await repo.save({
    id: `DYN-0${all.length + 1}`,
    plate: String(payload.plate).trim().toUpperCase(),
    bikeModel: String(payload.bikeModel).trim(),
    engineCc: Number(payload.engineCc),
    peakWheelHp: Number(payload.peakWheelHp),
    airFuelRatio: Number(payload.airFuelRatio || 12.9),
    totalInvoiceUsd: baseFee + partsCost
  });

  telemetryMetrics.totalOrdersCreated += 1;
  auditLog.push({
    auditId: `AUD-0${auditLog.length + 1}`,
    action: "DYNO_ORDER_CERTIFIED",
    orderId: saved.id,
    plate: saved.plate,
    timestamp: new Date().toISOString()
  });

  if (idemKey) {
    idempotencyCache.set(idemKey, saved);
  }

  return {
    idempotentReplay: false,
    ...(idemKey ? { idempotencyKey: idemKey } : {}),
    order: saved
  };
};
