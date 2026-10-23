const dishes = [
  { id: 1, name: "Taco al pastor", price: 3.5, stall: "El Trompo" },
  { id: 2, name: "Arepa reina pepiada", price: 4.25, stall: "Arepa Express" },
];
let nextId = 3;

const listDishes = () => dishes;
const getDishById = (id) => dishes.find((d) => d.id === Number(id)) || null;

function createDish({ name, price, stall }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");
  if (!stall || typeof stall !== "string" || !stall.trim()) throw new Error("stall es obligatorio");

  const numericPrice = Number(price);
  if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) throw new Error("price debe ser un numero mayor a 0");

  const dish = { id: nextId++, name: name.trim(), price: numericPrice, stall: stall.trim() };
  dishes.push(dish);
  return dish;
}

export { listDishes, getDishById, createDish };
