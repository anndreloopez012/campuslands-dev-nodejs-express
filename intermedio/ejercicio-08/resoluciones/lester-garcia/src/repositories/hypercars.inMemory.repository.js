const inMemoryHypercars = [
  {
    id: "1",
    chassisNumber: "BUG-BOLIDE-001",
    modelName: "Bolide",
    manufacturer: "Bugatti",
    horsePower: 1850,
    powertrain: "Combustión Quad-Turbo",
    topSpeedKmh: 500,
    limitedUnits: 40,
    inProduction: true
  },
  {
    id: "2",
    chassisNumber: "RIM-NEVERA-002",
    modelName: "Nevera R",
    manufacturer: "Rimac",
    horsePower: 2107,
    powertrain: "100% Eléctrico (Quad-Motor)",
    topSpeedKmh: 412,
    limitedUnits: 40,
    inProduction: true
  },
  {
    id: "3",
    chassisNumber: "KOE-JESKO-003",
    modelName: "Jesko Absolut",
    manufacturer: "Koenigsegg",
    horsePower: 1600,
    powertrain: "Híbrido V8 Twin-Turbo",
    topSpeedKmh: 531,
    limitedUnits: 125,
    inProduction: true
  }
];

export const findAll = async () => [...inMemoryHypercars];

export const findById = async (id) => {
  const item = inMemoryHypercars.find((h) => h.id === String(id));
  return item ? { ...item } : null;
};

export const findByChassis = async (chassisNumber) => {
  const item = inMemoryHypercars.find(
    (h) => h.chassisNumber.toUpperCase() === chassisNumber.toUpperCase()
  );
  return item ? { ...item } : null;
};

export const save = async (hypercarData) => {
  const newEntry = { ...hypercarData };
  inMemoryHypercars.push(newEntry);
  return { ...newEntry };
};

export const remove = async (id) => {
  const index = inMemoryHypercars.findIndex((h) => h.id === String(id));
  if (index === -1) return false;
  inMemoryHypercars.splice(index, 1);
  return true;
};