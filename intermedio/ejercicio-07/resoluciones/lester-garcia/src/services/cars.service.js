import * as carRepo from "../repositories/cars.inMemory.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllCarsService = async (filters = {}) => {
  let cars = await carRepo.findAll();
  const { category, brand, isAvailable } = filters;

  if (category) {
    cars = cars.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  if (brand) {
    cars = cars.filter((c) => c.brand.toLowerCase() === brand.toLowerCase());
  }

  if (isAvailable !== undefined) {
    const availableBool = isAvailable === "true";
    cars = cars.filter((c) => c.isAvailable === availableBool);
  }

  return cars;
};

export const getCarByIdService = async (id) => {
  const car = await carRepo.findById(id);
  if (!car) {
    throw new NotFoundError(`El superdeportivo con ID '${id}' no existe en el showroom.`);
  }
  return car;
};

export const registerCarService = async (payload) => {
  const existing = await carRepo.findByVin(payload.vin);
  if (existing) {
    throw new ConflictError(`El vehículo con VIN '${payload.vin}' ya se encuentra en el inventario.`);
  }

  const newCar = {
    id: String(Date.now()),
    vin: payload.vin.trim().toUpperCase(),
    brand: payload.brand.trim(),
    model: payload.model.trim(),
    horsePower: Number(payload.horsePower),
    category: payload.category.trim(),
    priceUSD: Number(payload.priceUSD),
    topSpeedKmh: Number(payload.topSpeedKmh),
    isAvailable: payload.isAvailable !== undefined ? Boolean(payload.isAvailable) : true
  };

  return await carRepo.save(newCar);
};

export const deleteCarService = async (id) => {
  const deleted = await carRepo.remove(id);
  if (!deleted) {
    throw new NotFoundError(`No se puede eliminar. Vehículo con ID '${id}' no encontrado.`);
  }
};

// Servicio de demostración para probar la captura de un error no operacional imprevisto (500)
export const simulateUnexpectedErrorService = async () => {
  // Dispara una excepción no controlada (ejemplo: acceder a una propiedad de null)
  const nullReference = null;
  return nullReference.unexistentMethod();
};