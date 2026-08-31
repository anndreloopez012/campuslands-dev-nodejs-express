const VALID_STATUSES = ["pendiente", "en_proceso", "finalizado"];

const orders = [
  { id: 1, moto: "Yamaha FZ 150", problema: "cambio de aceite", status: "pendiente" },
  { id: 2, moto: "Honda CB 190", problema: "frenos delanteros", status: "en_proceso" },
];
let nextId = 3;

function listOrders() {
  return orders;
}

function getOrderById(id) {
  return orders.find((o) => o.id === Number(id)) || null;
}

function createOrder({ moto, problema }) {
  if (!moto || typeof moto !== "string" || !moto.trim()) {
    throw badRequest("moto es obligatorio");
  }
  if (!problema || typeof problema !== "string" || !problema.trim()) {
    throw badRequest("problema es obligatorio");
  }

  const order = { id: nextId++, moto: moto.trim(), problema: problema.trim(), status: "pendiente" };
  orders.push(order);
  return order;
}

function updateOrderStatus(id, status) {
  const order = getOrderById(id);
  if (!order) {
    throw notFound(`Orden con id ${id} no encontrada`);
  }
  if (!VALID_STATUSES.includes(status)) {
    throw badRequest(`status debe ser uno de: ${VALID_STATUSES.join(", ")}`);
  }
  if (order.status === "finalizado") {
    const error = new Error("No se puede modificar una orden ya finalizada");
    error.status = 409;
    throw error;
  }

  order.status = status;
  return order;
}

function deleteOrder(id) {
  const index = orders.findIndex((o) => o.id === Number(id));
  if (index === -1) return false;
  orders.splice(index, 1);
  return true;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

export { listOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder, VALID_STATUSES };
