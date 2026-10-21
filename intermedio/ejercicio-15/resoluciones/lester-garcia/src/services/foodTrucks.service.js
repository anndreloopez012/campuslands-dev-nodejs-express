import * as trucksRepo from "../repositories/foodTrucks.inMemory.repository.js";
import { NotFoundError, ConflictError, ForbiddenError } from "../utils/customErrors.js";

export const getAllFoodTrucksService = async (specialty) => {
  let trucks = await trucksRepo.findAllFoodTrucks();
  if (specialty) {
    trucks = trucks.filter((t) => t.specialty.toLowerCase() === specialty.toLowerCase());
  }
  return trucks;
};

export const getFoodTruckByIdService = async (id) => {
  const truck = await trucksRepo.findFoodTruckById(id);
  if (!truck) {
    throw new NotFoundError(`El puesto callejero con ID '${id}' no existe.`);
  }
  return truck;
};

export const createFoodTruckService = async (payload, currentUser) => {
  const existing = await trucksRepo.findFoodTruckByName(payload.name);
  if (existing) {
    throw new ConflictError(`El food truck '${payload.name}' ya se encuentra registrado.`);
  }

  const newTruck = {
    id: String(Date.now()),
    name: payload.name.trim(),
    specialty: payload.specialty.trim(),
    locationZone: payload.locationZone.trim(),
    averagePriceUSD: Number(payload.averagePriceUSD),
    rating: 5.0, // Calificación inicial por defecto
    ownerId: currentUser.id
  };

  return await trucksRepo.saveFoodTruck(newTruck);
};

export const deleteFoodTruckService = async (id, currentUser) => {
  const truck = await trucksRepo.findFoodTruckById(id);
  if (!truck) {
    throw new NotFoundError(`No se puede eliminar. El puesto con ID '${id}' no fue localizado.`);
  }

  // Regla de autorización: Solo el dueño o un Chef_Owner pueden eliminar
  if (truck.ownerId !== currentUser.id && currentUser.role !== "Chef_Owner") {
    throw new ForbiddenError("No tienes permisos para dar de baja puestos de otros operadores gastronómicos.");
  }

  await trucksRepo.deleteFoodTruck(id);
};