import { findMotorcycle, getMaintenance, getMotorcycles, saveMaintenance, saveMotorcycle } from '../repositories/workshopRepository.js';

export function listWorkshopMotorcycles() {
  return getMotorcycles();
}

export function addWorkshopMotorcycle(brand, model) {
  return saveMotorcycle(brand, model);
}

export function listMotorcycleMaintenance(id) {
  const motorcycle = findMotorcycle(id);
  if (!motorcycle) return null;
  return { motorcycle, records: getMaintenance(id) };
}

export function addMotorcycleMaintenance(id, description) {
  if (!findMotorcycle(id)) return null;
  return saveMaintenance(id, description);
}
