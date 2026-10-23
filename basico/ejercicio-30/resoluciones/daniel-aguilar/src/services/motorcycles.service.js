const { badRequest, notFound, conflict } = require('../utils/app-error');

const PLATE_REGEX = /^[A-Z0-9-]{5,8}$/;

function validate(data) {
  const details = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw badRequest('Datos invalidos', ['El cuerpo debe ser un objeto JSON']);

  if (typeof data.brand !== 'string' || data.brand.trim().length < 2) details.push('brand debe tener al menos 2 caracteres');
  if (typeof data.model !== 'string' || data.model.trim().length < 1) details.push('model es obligatorio');
  if (!Number.isInteger(data.year) || data.year < 1950 || data.year > new Date().getFullYear() + 1) details.push('year debe ser un entero valido (1950 en adelante)');
  if (!Number.isInteger(data.displacementCc) || data.displacementCc < 50 || data.displacementCc > 3000) details.push('displacementCc debe ser un entero entre 50 y 3000');
  if (typeof data.plate !== 'string' || !PLATE_REGEX.test(data.plate.trim().toUpperCase())) details.push('plate debe tener de 5 a 8 caracteres (letras, numeros o guion)');
  if (details.length > 0) throw badRequest('Datos invalidos', details);

  return {
    brand: data.brand.trim(),
    model: data.model.trim(),
    year: data.year,
    displacementCc: data.displacementCc,
    plate: data.plate.trim().toUpperCase(),
  };
}

function createMotorcycleService({ hasOpenOrders = () => false } = {}) {
  const motorcycles = [
    { id: 1, brand: 'Honda', model: 'CB190R', year: 2022, displacementCc: 184, plate: 'M123ABC' },
    { id: 2, brand: 'Yamaha', model: 'MT-07', year: 2021, displacementCc: 689, plate: 'M456DEF' },
  ];
  let nextId = 3;

  const list = ({ brand } = {}) =>
    motorcycles.filter((moto) => !brand || moto.brand.toLowerCase() === brand.toLowerCase());

  function get(id) {
    const moto = motorcycles.find((item) => item.id === id);
    if (!moto) throw notFound(`La motocicleta ${id} no existe`);
    return moto;
  }

  function assertUniquePlate(plate, ignoreId) {
    if (motorcycles.some((moto) => moto.plate === plate && moto.id !== ignoreId)) {
      throw conflict(`Ya existe una motocicleta con la placa ${plate}`);
    }
  }

  function create(data) {
    const clean = validate(data);
    assertUniquePlate(clean.plate);
    const moto = { id: nextId, ...clean };
    nextId += 1;
    motorcycles.push(moto);
    return moto;
  }

  function update(id, data) {
    const current = get(id);
    const clean = validate(data);
    assertUniquePlate(clean.plate, id);
    Object.assign(current, clean);
    return current;
  }

  function remove(id) {
    const moto = get(id);
    if (hasOpenOrders(id)) throw conflict('No se puede eliminar: la motocicleta tiene ordenes abiertas');
    motorcycles.splice(motorcycles.indexOf(moto), 1);
  }

  return { list, get, create, update, remove };
}

module.exports = { createMotorcycleService };
