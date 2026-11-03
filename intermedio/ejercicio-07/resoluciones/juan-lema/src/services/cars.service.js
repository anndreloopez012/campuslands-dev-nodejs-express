const cars = [
  { id: 1, brand: "Ferrari", model: "Roma", price: 250000 },
  { id: 2, brand: "Bentley", model: "Continental GT", price: 230000 },
];
let nextId = 3;

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

const listCars = () => cars;

function getCarById(id) {
  if (!Number.isInteger(Number(id))) fail(400, "id debe ser numerico");

  const car = cars.find((c) => c.id === Number(id));
  if (!car) fail(404, `Auto con id ${id} no encontrado`);

  return car;
}

function createCar({ brand, model, price }) {
  if (!brand || typeof brand !== "string" || !brand.trim()) fail(400, "brand es obligatorio");
  if (!model || typeof model !== "string" || !model.trim()) fail(400, "model es obligatorio");

  const numericPrice = Number(price);
  if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) fail(400, "price debe ser un numero mayor a 0");

  const car = { id: nextId++, brand: brand.trim(), model: model.trim(), price: numericPrice };
  cars.push(car);
  return car;
}

export { listCars, getCarById, createCar };
