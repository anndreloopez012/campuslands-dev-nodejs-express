import * as hyperRepo from "../repositories/hypercars.inMemory.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllHypercarsService = async (filters = {}) => {
  let cars = await hyperRepo.findAll();
  const { manufacturer, powertrain } = filters;

  if (manufacturer) {
    cars = cars.filter((c) => c.manufacturer.toLowerCase().includes(manufacturer.toLowerCase()));
  }

  if (powertrain) {
    cars = cars.filter((c) => c.powertrain.toLowerCase() === powertrain.toLowerCase());
  }

  return cars;
};

export const getHypercarByIdService = async (id) => {
  const car = await hyperRepo.findById(id);
  if (!car) {
    throw new NotFoundError(`El hiperauto con ID '${id}' no existe en el catálogo.`);
  }
  return car;
};

export const registerHypercarService = async (payload) => {
  const existing = await hyperRepo.findByChassis(payload.chassisNumber);
  if (existing) {
    throw new ConflictError(`El número de chasis '${payload.chassisNumber}' ya se encuentra fabricado/registrado.`);
  }

  const newHypercar = {
    id: String(Date.now()),
    chassisNumber: payload.chassisNumber.trim().toUpperCase(),
    modelName: payload.modelName.trim(),
    manufacturer: payload.manufacturer.trim(),
    horsePower: Number(payload.horsePower),
    powertrain: payload.powertrain.trim(),
    topSpeedKmh: Number(payload.topSpeedKmh),
    limitedUnits: Number(payload.limitedUnits),
    inProduction: true
  };

  return await hyperRepo.save(newHypercar);
};

export const deleteHypercarService = async (id) => {
  const deleted = await hyperRepo.remove(id);
  if (!deleted) {
    throw new NotFoundError(`No se puede eliminar. El hiperauto con ID '${id}' no fue localizado.`);
  }
};