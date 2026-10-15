import * as motoRepo from "../repositories/motorcycles.inMemory.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllMotorcyclesService = async (filters = {}) => {
  let bikes = await motoRepo.findAll();
  const { brand, status } = filters;

  if (brand) {
    bikes = bikes.filter((b) => b.brand.toLowerCase() === brand.toLowerCase());
  }

  if (status) {
    bikes = bikes.filter((b) => b.currentStatus.toLowerCase() === status.toLowerCase());
  }

  return bikes;
};

export const getMotorcycleByIdService = async (id) => {
  const moto = await motoRepo.findById(id);
  if (!moto) {
    throw new NotFoundError(`La motocicleta con ID '${id}' no existe en el taller.`);
  }
  return moto;
};

export const registerMotorcycleService = async (payload) => {
  const existing = await motoRepo.findByVin(payload.vin);
  if (existing) {
    throw new ConflictError(`El número de serie (VIN) '${payload.vin}' ya está registrado en el taller.`);
  }

  const newBike = {
    id: String(Date.now()),
    vin: payload.vin.trim().toUpperCase(),
    brand: payload.brand.trim(),
    model: payload.model.trim(),
    cylinderCapacityCc: Number(payload.cylinderCapacityCc),
    engineType: payload.engineType.trim(),
    ownerName: payload.ownerName.trim(),
    currentStatus: payload.currentStatus ? payload.currentStatus.trim() : "Diagnóstico",
    repairCostUSD: Number(payload.repairCostUSD)
  };

  return await motoRepo.save(newBike);
};

export const updateMotorcycleStatusService = async (id, newStatus) => {
  const moto = await motoRepo.findById(id);
  if (!moto) {
    throw new NotFoundError(`No se puede actualizar. La motocicleta con ID '${id}' no fue localizada.`);
  }

  return await motoRepo.update(id, { currentStatus: newStatus.trim() });
};

export const deleteMotorcycleService = async (id) => {
  const success = await motoRepo.remove(id);
  if (!success) {
    throw new NotFoundError(`No se puede eliminar. Motocicleta con ID '${id}' no encontrada.`);
  }
};