const inMemoryWorkOrders = [
  {
    id: "ORD-01",
    plateNumber: "MT09-77K",
    bikeModel: "Yamaha MT-09 SP",
    engineCc: 890,
    serviceType: "Ajuste_Valvulas",
    laborHours: 4,
    partsCostUsd: 140,
    status: "En_Banco_Dinamometrico",
    createdAt: "2026-10-10T09:00:00.000Z"
  },
  {
    id: "ORD-02",
    plateNumber: "DUC-999V",
    bikeModel: "Ducati Panigale V4",
    engineCc: 1103,
    serviceType: "Suspension_Ohlins",
    laborHours: 3,
    partsCostUsd: 210,
    status: "Completado",
    createdAt: "2026-10-12T15:00:00.000Z"
  }
];

export const workOrdersRepository = {
  async findAll() {
    return [...inMemoryWorkOrders];
  },
  async findById(id) {
    const item = inMemoryWorkOrders.find((o) => o.id === String(id));
    return item ? { ...item } : null;
  },
  async save(data) {
    const newItem = { ...data };
    inMemoryWorkOrders.push(newItem);
    return { ...newItem };
  },
  async removeById(id) {
    const idx = inMemoryWorkOrders.findIndex((o) => o.id === String(id));
    if (idx === -1) return false;
    inMemoryWorkOrders.splice(idx, 1);
    return true;
  }
};
