import * as workOrdersService from "../services/workOrders.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllWorkOrdersController = asyncHandler(async (req, res) => {
  const orders = await workOrdersService.getAllWorkOrdersService(req.query);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: orders.length,
    data: orders
  });
});

export const getWorkOrderByIdController = asyncHandler(async (req, res) => {
  const order = await workOrdersService.getWorkOrderByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: order
  });
});

export const createWorkOrderController = asyncHandler(async (req, res) => {
  const created = await workOrdersService.createWorkOrderService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Orden de servicio mecánico creada y presupuestada exitosamente.",
    data: created
  });
});

export const deleteWorkOrderController = asyncHandler(async (req, res) => {
  const result = await workOrdersService.deleteWorkOrderService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    message: "Orden mecánica archivada por el jefe de taller.",
    data: result
  });
});
