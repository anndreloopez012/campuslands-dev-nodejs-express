const inMemoryWelds = [
  {
    id: "WLD-01",
    welderName: "Héctor Salamanca",
    baseMetal: "Acero Inoxidable AISI 316L",
    weldingProcess: "TIG",
    voltage: 18,
    amperage: 140,
    travelSpeedMmMin: 120,
    heatInputKjMm: 0.76,
    inspectionResult: "Aprobado_AWS_D1_1",
    createdAt: "2026-10-12T08:00:00.000Z"
  }
];

export const findAllWelds = async () => [...inMemoryWelds];

export const findWeldById = async (id) => {
  const item = inMemoryWelds.find((w) => w.id === String(id));
  return item ? { ...item } : null;
};

export const saveWeld = async (data) => {
  const newItem = { ...data };
  inMemoryWelds.push(newItem);
  return { ...newItem };
};
