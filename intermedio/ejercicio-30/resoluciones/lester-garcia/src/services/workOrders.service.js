import { config } from "../config/env.config.js";
import { workOrdersRepository } from "../repositories/workOrders.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const calculateOrderInvoice = (order, laborRate = config.workshop.laborHourRateUsd) => {
  const laborCostUsd = Number((order.laborHours * laborRate).toFixed(2));
  const totalInvoiceUsd = Number((laborCostUsd + order.partsCostUsd).toFixed(2));

  return {
    ...order,
    workshopName: config.workshop.name,
    billing: {
      laborHourRateUsd: laborRate,
      laborCostUsd,
      partsCostUsd: order.partsCostUsd,
      totalInvoiceUsd
    }
  };
};

export const getAllWorkOrdersService = async (
  filters = {},
  deps = { repo: workOrdersRepository }
) => {
  let orders = await deps.repo.findAll();

  if (filters.serviceType) {
    orders = orders.filter(
      (o) => o.serviceType.toLowerCase() === filters.serviceType.trim().toLowerCase()
    );
  }

  if (filters.minCc && !isNaN(Number(filters.minCc))) {
    orders = orders.filter((o) => o.engineCc >= Number(filters.minCc));
  }

  return orders.map((o) => calculateOrderInvoice(o));
};

export const getWorkOrderByIdService = async (id, deps = { repo: workOrdersRepository }) => {
  const order = await deps.repo.findById(id);
  if (!order) {
    throw new NotFoundError(`La orden mecánica con ID '${id}' no fue encontrada.`);
  }
  return calculateOrderInvoice(order);
};

export const createWorkOrderService = async (payload, deps = { repo: workOrdersRepository }) => {
  const all = await deps.repo.findAll();
  const nextId = `ORD-${String(all.length + 1).padStart(2, "0")}`;

  const newOrder = {
    id: nextId,
    plateNumber: payload.plateNumber.trim().toUpperCase(),
    bikeModel: payload.bikeModel.trim(),
    engineCc: Number(payload.engineCc),
    serviceType: payload.serviceType.trim(),
    laborHours: Number(payload.laborHours),
    partsCostUsd: Number(payload.partsCostUsd),
    status: "Recibida_En_Taller",
    createdAt: new Date().toISOString()
  };

  const saved = await deps.repo.save(newOrder);
  return calculateOrderInvoice(saved);
};

export const deleteWorkOrderService = async (id, deps = { repo: workOrdersRepository }) => {
  const deleted = await deps.repo.removeById(id);
  if (!deleted) {
    throw new NotFoundError(`La orden mecánica con ID '${id}' no existe.`);
  }
  return { deletedId: id };
};
