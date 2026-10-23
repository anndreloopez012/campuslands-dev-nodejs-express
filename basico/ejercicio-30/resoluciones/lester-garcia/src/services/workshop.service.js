import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/repairs.json");

const readRepairsFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeRepairsFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllRepairsService = async (filters = {}) => {
  let repairs = await readRepairsFile();
  const { status, model, client } = filters;

  if (status) {
    repairs = repairs.filter(
      (r) => r.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (model) {
    repairs = repairs.filter((r) =>
      r.motorcycleModel.toLowerCase().includes(model.toLowerCase())
    );
  }

  if (client) {
    repairs = repairs.filter((r) =>
      r.clientName.toLowerCase().includes(client.toLowerCase())
    );
  }

  return repairs;
};

export const getRepairByIdService = async (id) => {
  const repairs = await readRepairsFile();
  const repair = repairs.find((r) => r.id === String(id));

  if (!repair) {
    throw new NotFoundError(`La orden de reparación con ID '${id}' no fue encontrada.`);
  }

  return repair;
};

export const createRepairService = async ({
  ticketCode,
  clientName,
  motorcycleModel,
  serviceType,
  costUSD,
  status
}) => {
  const repairs = await readRepairsFile();

  const codeExists = repairs.some(
    (r) => r.ticketCode.toLowerCase() === ticketCode.toLowerCase()
  );

  if (codeExists) {
    throw new ConflictError(`El código de ticket '${ticketCode}' ya se encuentra registrado.`);
  }

  const newRepair = {
    id: String(Date.now()),
    ticketCode,
    clientName,
    motorcycleModel,
    serviceType,
    costUSD: Number(costUSD),
    status: status || "Pending"
  };

  repairs.push(newRepair);
  await writeRepairsFile(repairs);

  return newRepair;
};

export const updateRepairService = async (
  id,
  { ticketCode, clientName, motorcycleModel, serviceType, costUSD, status }
) => {
  const repairs = await readRepairsFile();
  const index = repairs.findIndex((r) => r.id === String(id));

  if (index === -1) {
    throw new NotFoundError(`No se puede actualizar. La orden con ID '${id}' no existe.`);
  }

  const conflict = repairs.some(
    (r) => r.ticketCode.toLowerCase() === ticketCode.toLowerCase() && r.id !== String(id)
  );

  if (conflict) {
    throw new ConflictError(`Otro ticket ya utiliza el código '${ticketCode}'.`);
  }

  const updatedRepair = {
    id: String(id),
    ticketCode,
    clientName,
    motorcycleModel,
    serviceType,
    costUSD: Number(costUSD),
    status
  };

  repairs[index] = updatedRepair;
  await writeRepairsFile(repairs);

  return updatedRepair;
};

export const deleteRepairService = async (id) => {
  const repairs = await readRepairsFile();
  const index = repairs.findIndex((r) => r.id === String(id));

  if (index === -1) {
    throw new NotFoundError(`No se puede eliminar. La orden con ID '${id}' no existe.`);
  }

  repairs.splice(index, 1);
  await writeRepairsFile(repairs);
};