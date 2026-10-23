import {
  getAllWeldingJobsService,
  getWeldingJobByIdService,
  createWeldingJobService,
  resetWeldingMemoryService
} from "../services/welding.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_PROCESSES = ["SMAW", "GMAW (MIG/MAG)", "GTAW (TIG)", "FCAW", "SAW"];

export const getWeldingJobsController = asyncHandler(async (req, res) => {
  const { process: processType, material, inspectionPassed } = req.query;

  const jobs = await getAllWeldingJobsService({
    process: processType,
    material,
    inspectionPassed
  });

  return res.status(200).json({
    status: "success",
    totalInMemory: jobs.length,
    data: jobs
  });
});

export const getWeldingJobByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await getWeldingJobByIdService(id);

  return res.status(200).json({
    status: "success",
    data: job
  });
});

export const createWeldingJobController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const {
    jobCode,
    process: processType,
    material,
    welderName,
    voltageVolts,
    amperageAmps,
    inspectionPassed,
    inspectionDate
  } = req.body;

  if (!jobCode || typeof jobCode !== "string" || jobCode.trim() === "") {
    throw new BadRequestError("El campo 'jobCode' es obligatorio.");
  }

  if (!processType || !VALID_PROCESSES.includes(processType.trim())) {
    throw new BadRequestError(
      `El campo 'process' debe ser un tipo válido de soldadura: ${VALID_PROCESSES.join(", ")}.`
    );
  }

  if (!material || typeof material !== "string" || material.trim() === "") {
    throw new BadRequestError("El campo 'material' es obligatorio.");
  }

  if (!welderName || typeof welderName !== "string" || welderName.trim() === "") {
    throw new BadRequestError("El campo 'welderName' (soldador) es obligatorio.");
  }

  const volts = Number(voltageVolts);
  if (voltageVolts === undefined || isNaN(volts) || volts <= 0) {
    throw new BadRequestError("El campo 'voltageVolts' debe ser un número mayor a 0.");
  }

  const amps = Number(amperageAmps);
  if (amperageAmps === undefined || isNaN(amps) || amps <= 0) {
    throw new BadRequestError("El campo 'amperageAmps' debe ser un número mayor a 0.");
  }

  const newJob = await createWeldingJobService({
    jobCode: jobCode.trim(),
    process: processType.trim(),
    material: material.trim(),
    welderName: welderName.trim(),
    voltageVolts: volts,
    amperageAmps: amps,
    inspectionPassed,
    inspectionDate
  });

  return res.status(201).json({
    status: "success",
    data: newJob
  });
});

export const resetWeldingMemoryController = asyncHandler(async (req, res) => {
  const result = await resetWeldingMemoryService();
  return res.status(200).json({
    status: "success",
    data: result
  });
});