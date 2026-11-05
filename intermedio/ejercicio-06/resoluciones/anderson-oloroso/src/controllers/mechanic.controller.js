import * as mechanicService from '../services/mechanic.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'validacion centralizada'
  });
};

export const listOrders = (req, res) => {
  const orders = mechanicService.getOrders();
  return res.status(200).json({
    ok: true,
    total: orders.length,
    data: orders
  });
};

export const registerOrder = (req, res) => {
  // El payload ya fue validado y normalizado previamente por el middleware
  const newOrder = mechanicService.createOrder(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Orden de servicio mecánico validada y creada satisfactoriamente',
    data: newOrder
  });
};
