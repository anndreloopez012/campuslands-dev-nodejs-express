import { listOrdersByUser, getOrderById, createOrder } from "../services/orders.service.js";

const getOrders = (req, res) => res.json({ ok: true, data: listOrdersByUser(req.user.id) });

function getOrder(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const order = getOrderById(id);
  if (!order) return res.status(404).json({ ok: false, message: `Pedido con id ${id} no encontrado` });
  if (order.userId !== req.user.id) return res.status(403).json({ ok: false, message: "No tienes acceso a este pedido" });

  res.json({ ok: true, data: order });
}

function postOrder(req, res) {
  try {
    res.status(201).json({ ok: true, data: createOrder(req.user.id, req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getOrders, getOrder, postOrder };
