const inMemoryPlanets = [
  {
    id: "PLN-01",
    name: "Tierra Prima",
    sector: "Sector 001 - Solar",
    climate: "Templado",
    populationBillions: 8.5
  },
  {
    id: "PLN-02",
    name: "Vulcan",
    sector: "Sector 40-Eridani",
    climate: "Árido y Volcánico",
    populationBillions: 6.2
  },
  {
    id: "PLN-03",
    name: "Kronos",
    sector: "Sector Klingon",
    climate: "Hostil",
    populationBillions: 11.0
  }
];

export const findAllPlanets = async () => [...inMemoryPlanets];

export const findPlanetById = async (id) => {
  const planet = inMemoryPlanets.find((p) => p.id === String(id));
  return planet ? { ...planet } : null;
};

export const savePlanet = async (planetData) => {
  const newPlanet = { ...planetData };
  inMemoryPlanets.push(newPlanet);
  return { ...newPlanet };
};

export const deletePlanet = async (id) => {
  const index = inMemoryPlanets.findIndex((p) => p.id === String(id));
  if (index === -1) return false;
  inMemoryPlanets.splice(index, 1);
  return true;
};