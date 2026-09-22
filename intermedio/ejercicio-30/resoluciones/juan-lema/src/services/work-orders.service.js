import { AppError } from "../errors.js";

const STATUS_ORDER = Object.freeze(["recibida", "en_diagnostico", "en_reparacion", "lista", "entregada"]);
const ID_PATTERN = /^[1-9]\d*$/;

const invalid = (code, message) => new AppError(400, code, message);
const nextStatusOf = (status) => STATUS_ORDER[STATUS_ORDER.indexOf(status) + 1];

function createWorkOrdersService({ motorcycles }) {
  const orders = [];
  let nextId = 1;

  function findById(id) {
    if (!ID_PATTERN.test(id)) throw invalid("INVALID_ID", "id debe ser un entero positivo");

    const order = orders.find((o) => o.id === Number(id));
    if (!order) throw new AppError(404, "NOT_FOUND", `Orden de trabajo ${id} no encontrada`);
    return order;
  }

  function list({ status } = {}) {
    if (status !== undefined && !STATUS_ORDER.includes(status)) throw invalid("INVALID_QUERY", `status debe ser uno de: ${STATUS_ORDER.join(", ")}`);

    return orders.filter((o) => status === undefined || o.status === status).map((o) => ({ ...o }));
  }

  const getById = (id) => ({ ...findById(id) });

  function create({ motorcycleId, description } = {}) {
    if (!ID_PATTERN.test(String(motorcycleId))) throw invalid("INVALID_BODY", "motorcycleId debe ser un entero positivo");
    if (!motorcycles.exists(motorcycleId)) throw invalid("INVALID_BODY", `motorcycleId ${motorcycleId} no corresponde a una moto registrada`);
    if (typeof description !== "string" || description.trim().length < 5 || description.trim().length > 200) throw invalid("INVALID_BODY", "description debe tener entre 5 y 200 caracteres");

    const order = { id: nextId++, motorcycleId: Number(motorcycleId), description: description.trim(), status: STATUS_ORDER[0], mechanic: null };
    orders.push(order);
    return { ...order };
  }

  function advance(id, targetStatus, mechanic) {
    const order = findById(id);
    const expected = nextStatusOf(order.status);
    if (targetStatus !== expected) throw new AppError(409, "INVALID_TRANSITION", expected ? `Desde ${order.status} solo se puede pasar a ${expected}` : `La orden ${id} ya esta en el ultimo estado (${order.status})`);

    order.status = targetStatus;
    if (order.mechanic === null && mechanic) order.mechanic = mechanic;
    return { ...order };
  }

  function remove(id) {
    const order = findById(id);
    orders.splice(orders.indexOf(order), 1);
  }

  return { list, getById, create, advance, remove };
}

export { createWorkOrdersService, STATUS_ORDER };
