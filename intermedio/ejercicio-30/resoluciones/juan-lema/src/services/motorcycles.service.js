import { AppError } from "../errors.js";

const ID_PATTERN = /^[1-9]\d*$/;
const PLATE_PATTERN = /^[A-Z0-9]{5,8}$/;

const invalid = (code, message) => new AppError(400, code, message);

function checkText(value, field, { min = 2, max = 40 } = {}) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) throw invalid("INVALID_BODY", `${field} debe tener entre ${min} y ${max} caracteres`);
}

function createMotorcyclesService({ seed = [] } = {}) {
  const motorcycles = [];
  let nextId = 1;

  function findById(id) {
    if (!ID_PATTERN.test(id)) throw invalid("INVALID_ID", "id debe ser un entero positivo");

    const motorcycle = motorcycles.find((m) => m.id === Number(id));
    if (!motorcycle) throw new AppError(404, "NOT_FOUND", `Moto ${id} no encontrada`);
    return motorcycle;
  }

  const list = () => motorcycles.map((m) => ({ ...m }));
  const getById = (id) => ({ ...findById(id) });
  const exists = (id) => motorcycles.some((m) => m.id === Number(id));

  function create({ plate, brand, model, ownerName } = {}) {
    if (typeof plate !== "string" || !PLATE_PATTERN.test(plate.trim().toUpperCase())) throw invalid("INVALID_BODY", "plate debe tener entre 5 y 8 caracteres alfanumericos");
    checkText(brand, "brand");
    checkText(model, "model");
    checkText(ownerName, "ownerName");

    const normalizedPlate = plate.trim().toUpperCase();
    if (motorcycles.some((m) => m.plate === normalizedPlate)) throw new AppError(409, "PLATE_TAKEN", `Ya existe una moto con la placa ${normalizedPlate}`);

    const motorcycle = { id: nextId++, plate: normalizedPlate, brand: brand.trim(), model: model.trim(), ownerName: ownerName.trim() };
    motorcycles.push(motorcycle);
    return { ...motorcycle };
  }

  seed.forEach(create);
  return { list, getById, exists, create };
}

const SEED_MOTORCYCLES = Object.freeze([
  { plate: "ABC123", brand: "Yamaha", model: "MT-07", ownerName: "Carlos Vega" },
  { plate: "XYZ789", brand: "Honda", model: "CB190R", ownerName: "Diana Reyes" },
]);

export { createMotorcyclesService, SEED_MOTORCYCLES };
