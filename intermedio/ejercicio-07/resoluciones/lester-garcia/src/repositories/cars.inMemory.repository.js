const inMemoryShowroom = [
  {
    id: "1",
    vin: "ZHWEC1ZF5LLA00001",
    brand: "Lamborghini",
    model: "Revuelto",
    horsePower: 1015,
    category: "Hypercar",
    priceUSD: 608000,
    topSpeedKmh: 350,
    isAvailable: true
  },
  {
    id: "2",
    vin: "ZFF93NHA5P0000002",
    brand: "Ferrari",
    model: "296 GTB",
    horsePower: 830,
    category: "Supercar",
    priceUSD: 340000,
    topSpeedKmh: 330,
    isAvailable: false
  }
];

export const findAll = async () => [...inMemoryShowroom];

export const findById = async (id) => {
  const car = inMemoryShowroom.find((c) => c.id === String(id));
  return car ? { ...car } : null;
};

export const findByVin = async (vin) => {
  const car = inMemoryShowroom.find((c) => c.vin.toUpperCase() === vin.toUpperCase());
  return car ? { ...car } : null;
};

export const save = async (carData) => {
  const newCar = { ...carData };
  inMemoryShowroom.push(newCar);
  return { ...newCar };
};

export const remove = async (id) => {
  const index = inMemoryShowroom.findIndex((c) => c.id === String(id));
  if (index === -1) return false;
  inMemoryShowroom.splice(index, 1);
  return true;
};