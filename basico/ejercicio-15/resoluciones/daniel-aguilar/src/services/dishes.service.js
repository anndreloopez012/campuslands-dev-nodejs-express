const dishes = [
  { id: 1, name: 'Tacos al pastor', type: 'taco', price: 3.5 },
  { id: 2, name: 'Hot dog con guacamole', type: 'hotdog', price: 2.75 },
  { id: 3, name: 'Elote loco', type: 'snack', price: 2.25 },
];
const TYPES = ['taco', 'hotdog', 'snack', 'bebida', 'postre'];

function listDishes(type) {
  return type ? dishes.filter((dish) => dish.type === type) : dishes;
}

const getDish = (id) => dishes.find((dish) => dish.id === id) || null;

function validateDish(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['El cuerpo debe ser un objeto JSON'];
  if (typeof data.name !== 'string' || data.name.trim().length < 2) errors.push('name debe tener al menos 2 caracteres');
  if (!TYPES.includes(data.type)) errors.push(`type debe ser uno de: ${TYPES.join(', ')}`);
  if (typeof data.price !== 'number' || !(data.price > 0)) errors.push('price debe ser un numero mayor a 0');
  return errors;
}

function createDish(data) {
  const dish = {
    id: dishes.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    name: data.name.trim(),
    type: data.type,
    price: data.price,
  };
  dishes.push(dish);
  return dish;
}

module.exports = { TYPES, listDishes, getDish, validateDish, createDish };
