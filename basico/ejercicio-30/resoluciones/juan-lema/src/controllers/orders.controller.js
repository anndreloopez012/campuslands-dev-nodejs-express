import { listOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } from "../services/orders.service.js";

function getOrders(req, res) {
  res.status(200).json({ ok: true, data: listOrders() });
}

function getOrder(req, res, next) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const order = getOrderById(id);
  if (!order) {
    res.status(404).json({ ok: false, message: `Orden con id ${id} no encontrada` });
    return;
  }

  res.status(200).json({ ok: true, data: order });
}

function postOrder(req, res, next) {
  try {
    const order = createOrder(req.body || {});
    res.location(`/orders/${order.id}`);
    res.status(201).json({ ok: true, data: order });
  } catch (error) {
    next(error);
  }
}

function patchOrderStatus(req, res, next) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  try {
    const order = updateOrderStatus(id, (req.body || {}).status);
    res.status(200).json({ ok: true, data: order });
  } catch (error) {
    next(error);
  }
}

function removeOrder(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const removed = deleteOrder(id);
  if (!removed) {
    res.status(404).json({ ok: false, message: `Orden con id ${id} no encontrada` });
    return;
  }

  res.status(204).end();
}

export { getOrders, getOrder, postOrder, patchOrderStatus, removeOrder };
