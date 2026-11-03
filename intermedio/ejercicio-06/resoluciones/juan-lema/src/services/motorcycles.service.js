const motorcycles = [
  { id: 1, brand: "Yamaha", model: "MT-07", cc: 689, status: "operativa" },
  { id: 2, brand: "Honda", model: "CB190R", cc: 184, status: "en_taller" },
];
let nextId = 3;

const listMotorcycles = () => motorcycles;
const getMotorcycleById = (id) => motorcycles.find((m) => m.id === Number(id)) || null;

function createMotorcycle({ brand, model, cc, status }) {
  const motorcycle = { id: nextId++, brand: brand.trim(), model: model.trim(), cc: Number(cc), status: status ?? "operativa" };
  motorcycles.push(motorcycle);
  return motorcycle;
}

export { listMotorcycles, getMotorcycleById, createMotorcycle };
