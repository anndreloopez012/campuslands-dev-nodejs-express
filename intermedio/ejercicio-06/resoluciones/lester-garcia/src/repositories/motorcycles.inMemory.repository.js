const inMemoryWorkshop = [
  {
    id: "1",
    vin: "JH2PC37025M100001",
    brand: "Honda",
    model: "CBR600RR",
    cylinderCapacityCc: 599,
    engineType: "Cuatro en Línea",
    ownerName: "Esteban Carranza",
    currentStatus: "Diagnóstico",
    repairCostUSD: 180.00
  },
  {
    id: "2",
    vin: "WB1041904KZ200002",
    brand: "BMW",
    model: "R 1250 GS",
    cylinderCapacityCc: 1254,
    engineType: "Bóxer",
    ownerName: "Valeria Montero",
    currentStatus: "En Reparación",
    repairCostUSD: 450.00
  }
];

export const findAll = async () => {
  return [...inMemoryWorkshop];
};

export const findById = async (id) => {
  const moto = inMemoryWorkshop.find((m) => m.id === String(id));
  return moto ? { ...moto } : null;
};

export const findByVin = async (vin) => {
  const moto = inMemoryWorkshop.find((m) => m.vin.toUpperCase() === vin.toUpperCase());
  return moto ? { ...moto } : null;
};

export const save = async (motoData) => {
  const newEntry = { ...motoData };
  inMemoryWorkshop.push(newEntry);
  return { ...newEntry };
};

export const update = async (id, updatedFields) => {
  const index = inMemoryWorkshop.findIndex((m) => m.id === String(id));
  if (index === -1) return null;

  inMemoryWorkshop[index] = {
    ...inMemoryWorkshop[index],
    ...updatedFields,
    id: String(id)
  };

  return { ...inMemoryWorkshop[index] };
};

export const remove = async (id) => {
  const index = inMemoryWorkshop.findIndex((m) => m.id === String(id));
  if (index === -1) return false;

  inMemoryWorkshop.splice(index, 1);
  return true;
};