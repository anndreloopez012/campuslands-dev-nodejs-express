import * as repo from "../repositories/welding-tasks.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const schedulerHistory = [];

export const runPreventativeGasAuditJob = async () => {
  const stations = await repo.findAll();
  const lowPressureStations = stations.filter((s) => s.shieldingGasBar < 5.0);
  const runRecord = {
    jobExecutionId: `CRON-0${schedulerHistory.length + 1}`,
    jobName: "VERIFY_ARGON_SHIELDING_GAS",
    executedAt: new Date().toISOString(),
    inspectedCount: stations.length,
    lowPressureAlerts: lowPressureStations.map((s) => s.stationCode)
  };
  schedulerHistory.push(runRecord);
  return runRecord;
};

export const listItemsService = async () => {
  if (schedulerHistory.length === 0) {
    await runPreventativeGasAuditJob();
  }
  return {
    schedulerHistory: [...schedulerHistory],
    stations: await repo.findAll()
  };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La estación de soldadura '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (payload.triggerScheduledJobNow) {
    return runPreventativeGasAuditJob();
  }
  if (!payload.stationCode || !payload.processType) {
    throw new BadRequestError("Se requiere 'stationCode' y 'processType' (o 'triggerScheduledJobNow': true).");
  }
  const all = await repo.findAll();
  const saved = await repo.save({
    id: `WLD-0${all.length + 1}`,
    stationCode: payload.stationCode.trim().toUpperCase(),
    processType: payload.processType.trim(),
    shieldingGasBar: Number(payload.shieldingGasBar ?? 7.5),
    lastScheduledCheck: new Date().toISOString()
  });
  await runPreventativeGasAuditJob();
  return saved;
};
