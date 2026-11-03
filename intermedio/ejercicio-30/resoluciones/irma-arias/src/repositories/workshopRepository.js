const motorcycles = [{ id: 1, brand: 'Yamaha', model: 'FZ' }];
const maintenanceRecords = [{ id: 1, motorcycleId: 1, description: 'Revisión inicial' }];

export function getMotorcycles() {
  return motorcycles;
}

export function findMotorcycle(id) {
  return motorcycles.find((motorcycle) => motorcycle.id === id);
}

export function saveMotorcycle(brand, model) {
  const motorcycle = { id: motorcycles.length + 1, brand, model };
  motorcycles.push(motorcycle);
  return motorcycle;
}

export function getMaintenance(motorcycleId) {
  return maintenanceRecords.filter((record) => record.motorcycleId === motorcycleId);
}

export function saveMaintenance(motorcycleId, description) {
  const record = { id: maintenanceRecords.length + 1, motorcycleId, description };
  maintenanceRecords.push(record);
  return record;
}
