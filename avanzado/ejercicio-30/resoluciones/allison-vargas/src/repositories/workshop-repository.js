export function createWorkshopRepository() {
  const motorcycles = new Map();
  const workOrders = new Map();
  return {
    listMotorcycles() { return [...motorcycles.values()]; },
    findMotorcycle(id) { return motorcycles.get(id) ?? null; },
    findMotorcycleByPlate(plate) { return [...motorcycles.values()].find((motorcycle) => motorcycle.plate === plate) ?? null; },
    saveMotorcycle(motorcycle) { motorcycles.set(motorcycle.id, motorcycle); return motorcycle; },
    listWorkOrders() { return [...workOrders.values()]; },
    findWorkOrder(id) { return workOrders.get(id) ?? null; },
    saveWorkOrder(order) { workOrders.set(order.id, order); return order; }
  };
}
