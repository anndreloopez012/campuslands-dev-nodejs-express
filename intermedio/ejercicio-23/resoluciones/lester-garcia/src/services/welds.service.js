import * as weldsRepo from "../repositories/welds.inMemory.repository.js";
import { calculateHeatInput, classifyWeldQuality } from "../utils/weldingCalculator.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getAllWeldsService = async () => {
  return await weldsRepo.findAllWelds();
};

export const getWeldByIdService = async (id) => {
  const weld = await weldsRepo.findWeldById(id);
  if (!weld) {
    throw new NotFoundError(`El registro de soldadura con ID '${id}' no existe.`);
  }
  return weld;
};

export const createWeldService = async (payload) => {
  const all = await weldsRepo.findAllWelds();
  const nextId = `WLD-${String(all.length + 1).padStart(2, "0")}`;

  const heatInputKjMm = calculateHeatInput({
    voltage: payload.voltage,
    amperage: payload.amperage,
    travelSpeedMmMin: payload.travelSpeedMmMin,
    weldingProcess: payload.weldingProcess.trim()
  });

  const inspectionResult = classifyWeldQuality(heatInputKjMm);

  const newWeld = {
    id: nextId,
    welderName: payload.welderName.trim(),
    baseMetal: payload.baseMetal.trim(),
    weldingProcess: payload.weldingProcess.trim(),
    voltage: Number(payload.voltage),
    amperage: Number(payload.amperage),
    travelSpeedMmMin: Number(payload.travelSpeedMmMin),
    heatInputKjMm,
    inspectionResult,
    createdAt: new Date().toISOString()
  };

  return await weldsRepo.saveWeld(newWeld);
};
