import { workOrders } from '../data/workorders.data.js';
import { AppError } from '../utils/app-error.js';

// Listado con filtro por status y paginación
export const list = (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    return next(new AppError("page debe ser >= 1 y limit entre 1 y 50", 400));
  }

  const { status } = req.query;
  const filtered = status ? workOrders.filter((w) => w.status.toLowerCase() === status.toLowerCase()) : workOrders;
  const start = (page - 1) * limit;

  res.status(200).json({
    ok: true,
    requestId: req.id,
    meta: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    data: filtered.slice(start, start + limit)
  });
};

export const getOne = (req, res, next) => {
  const order = workOrders.find((w) => w.id === Number(req.params.id));
  if (!order) return next(new AppError("Orden no encontrada", 404));
  res.status(200).json({ ok: true, data: order });
};

export const create = (req, res, next) => {
  const { motorcycle, service, costUsd } = req.body || {};
  if (!motorcycle || !service || typeof costUsd !== 'number') {
    return next(new AppError("Se requieren motorcycle, service y costUsd (número)", 400));
  }

  const order = { id: Math.max(0, ...workOrders.map((w) => w.id)) + 1, motorcycle, service, status: "Pendiente", costUsd };
  workOrders.push(order);
  res.status(201).json({ ok: true, data: order });
};
