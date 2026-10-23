import { getSneakerById } from "./sneakers.service.js";

const orders = [
  { id: 1, userId: 1, sneakerId: 1, size: 42, quantity: 1, total: 120 },
  { id: 2, userId: 2, sneakerId: 2, size: 40, quantity: 2, total: 360 },
];
let nextId = 3;

const listOrdersByUser = (userId) => orders.filter((o) => o.userId === userId);
const getOrderById = (id) => orders.find((o) => o.id === Number(id)) || null;

function createOrder(userId, { sneakerId, size, quantity }) {
  const sneaker = getSneakerById(sneakerId);
  if (!sneaker) throw new Error(`sneakerId ${sneakerId} no corresponde a un sneaker existente`);

  const numericSize = Number(size);
  if (!Number.isInteger(numericSize) || numericSize < 35 || numericSize > 46) throw new Error("size debe ser un entero entre 35 y 46");

  const numericQuantity = Number(quantity);
  if (!Number.isInteger(numericQuantity) || numericQuantity < 1 || numericQuantity > 5) throw new Error("quantity debe ser un entero entre 1 y 5");

  const order = { id: nextId++, userId, sneakerId: sneaker.id, size: numericSize, quantity: numericQuantity, total: sneaker.price * numericQuantity };
  orders.push(order);
  return order;
}

export { listOrdersByUser, getOrderById, createOrder };
