const inMemoryFoodTrucks = [
  {
    id: "1",
    name: "El Pastor Nocturno",
    specialty: "Tacos & Birria",
    locationZone: "Plaza Central - Zona Rosa",
    averagePriceUSD: 8.5,
    rating: 4.8,
    ownerId: "USR-CHEF-01"
  },
  {
    id: "2",
    name: "Smash & Crunch Co.",
    specialty: "Hamburguesas Smash",
    locationZone: "Avenida Reforma - Esquina 4",
    averagePriceUSD: 11.0,
    rating: 4.6,
    ownerId: "USR-CHEF-01"
  },
  {
    id: "3",
    name: "Seoul Express Dumplings",
    specialty: "Comida Callejera Asiática",
    locationZone: "Paseo Gastronómico Norte",
    averagePriceUSD: 9.0,
    rating: 4.9,
    ownerId: "USR-FOODIE-02"
  }
];

export const findAllFoodTrucks = async () => [...inMemoryFoodTrucks];

export const findFoodTruckById = async (id) => {
  const truck = inMemoryFoodTrucks.find((t) => t.id === String(id));
  return truck ? { ...truck } : null;
};

export const findFoodTruckByName = async (name) => {
  const truck = inMemoryFoodTrucks.find(
    (t) => t.name.toLowerCase() === name.toLowerCase().trim()
  );
  return truck ? { ...truck } : null;
};

export const saveFoodTruck = async (truckData) => {
  const newTruck = { ...truckData };
  inMemoryFoodTrucks.push(newTruck);
  return { ...newTruck };
};

export const deleteFoodTruck = async (id) => {
  const index = inMemoryFoodTrucks.findIndex((t) => t.id === String(id));
  if (index === -1) return false;
  inMemoryFoodTrucks.splice(index, 1);
  return true;
};