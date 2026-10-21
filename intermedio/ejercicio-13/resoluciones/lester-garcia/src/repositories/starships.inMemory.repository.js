const inMemoryStarships = [
  {
    id: "1",
    registryCode: "NCC-1701-D",
    name: "USS Enterprise",
    shipClass: "Crucero de Batalla",
    warpSpeed: 9.6,
    homePlanetId: "PLN-01",
    isActive: true
  },
  {
    id: "2",
    registryCode: "VLC-SURAK-02",
    name: "T'Plana-Hath",
    shipClass: "Explorador Científico",
    warpSpeed: 8.4,
    homePlanetId: "PLN-02",
    isActive: true
  },
  {
    id: "3",
    registryCode: "IKG-BIRD-03",
    name: "IKS Bortas",
    shipClass: "Crucero de Batalla",
    warpSpeed: 9.2,
    homePlanetId: "PLN-03",
    isActive: false
  }
];

export const findAllStarships = async () => [...inMemoryStarships];

export const findStarshipById = async (id) => {
  const ship = inMemoryStarships.find((s) => s.id === String(id));
  return ship ? { ...ship } : null;
};

export const findStarshipByRegistry = async (registryCode) => {
  const ship = inMemoryStarships.find(
    (s) => s.registryCode.toLowerCase() === registryCode.toLowerCase()
  );
  return ship ? { ...ship } : null;
};

export const findStarshipsByPlanetId = async (planetId) => {
  return inMemoryStarships.filter((s) => s.homePlanetId === String(planetId));
};

export const saveStarship = async (shipData) => {
  const newShip = { ...shipData };
  inMemoryStarships.push(newShip);
  return { ...newShip };
};

export const deleteStarship = async (id) => {
  const index = inMemoryStarships.findIndex((s) => s.id === String(id));
  if (index === -1) return false;
  inMemoryStarships.splice(index, 1);
  return true;
};