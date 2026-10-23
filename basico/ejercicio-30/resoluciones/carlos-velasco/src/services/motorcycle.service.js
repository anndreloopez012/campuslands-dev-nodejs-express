let motorcycles = [
  {
    id: 1,
    brand: "Yamaha",
    model: "MT-07",
    year: 2024,
    type: "Naked",
    maintenanceStatus: "pendiente"
  },
  {
    id: 2,
    brand: "Honda",
    model: "CBR500R",
    year: 2023,
    type: "Deportiva",
    maintenanceStatus: "realizado"
  }
];

function getAllMotorcycles() {
  return motorcycles;
}

function getMotorcycleById(id) {
  return motorcycles.find((motorcycle) => motorcycle.id === id);
}

function createMotorcycle(data) {
  const newMotorcycle = {
    id: motorcycles.length > 0
      ? Math.max(...motorcycles.map((motorcycle) => motorcycle.id)) + 1
      : 1,
    brand: data.brand,
    model: data.model,
    year: data.year,
    type: data.type,
    maintenanceStatus: data.maintenanceStatus
  };

  motorcycles.push(newMotorcycle);

  return newMotorcycle;
}

function updateMotorcycle(id, data) {
  const index = motorcycles.findIndex(
    (motorcycle) => motorcycle.id === id
  );

  if (index === -1) {
    return null;
  }

  motorcycles[index] = {
    ...motorcycles[index],
    brand: data.brand,
    model: data.model,
    year: data.year,
    type: data.type,
    maintenanceStatus: data.maintenanceStatus
  };

  return motorcycles[index];
}

function deleteMotorcycle(id) {
  const index = motorcycles.findIndex(
    (motorcycle) => motorcycle.id === id
  );

  if (index === -1) {
    return null;
  }

  const deletedMotorcycle = motorcycles[index];

  motorcycles.splice(index, 1);

  return deletedMotorcycle;
}

module.exports = {
  getAllMotorcycles,
  getMotorcycleById,
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle
};