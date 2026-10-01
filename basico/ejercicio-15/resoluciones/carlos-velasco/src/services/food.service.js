const foods = [
  {
    id: 1,
    name: 'Tacos al pastor',
    category: 'tacos',
    price: 25
  },
  {
    id: 2,
    name: 'Hamburguesa urbana',
    category: 'hamburguesas',
    price: 45
  },
  {
    id: 3,
    name: 'Hot dog callejero',
    category: 'hot dogs',
    price: 30
  }
];

const getFoods = () => {
  return foods;
};

const getFoodById = (id) => {
  return foods.find((food) => food.id === id);
};

const createFood = ({ name, category, price }) => {
  if (
    typeof name !== 'string' ||
    name.trim() === ''
  ) {
    const error = new Error('El nombre de la comida es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  if (
    typeof category !== 'string' ||
    category.trim() === ''
  ) {
    const error = new Error('La categoria es obligatoria');
    error.statusCode = 400;
    throw error;
  }

  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    const error = new Error('El precio debe ser un numero positivo');
    error.statusCode = 400;
    throw error;
  }

  const food = {
    id: foods.length + 1,
    name: name.trim(),
    category: category.trim(),
    price
  };

  foods.push(food);

  return food;
};

module.exports = {
  getFoods,
  getFoodById,
  createFood
};