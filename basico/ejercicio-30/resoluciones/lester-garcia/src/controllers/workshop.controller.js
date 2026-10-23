import {
  getAllRepairsService,
  getRepairByIdService,
  createRepairService,
  updateRepairService,
  deleteRepairService
} from "../services/workshop.service.js";
import { BadRequestError, UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_STATUSES = ["Pending", "In Progress", "Waiting for Parts", "Completed", "Cancelled"];

export const getAllRepairsController = asyncHandler(async (req, res) => {
  const { status, model, client } = req.query;

  const repairs = await getAllRepairsService({ status, model, client });

  return res.status(200).json({
    status: "success",
    total: repairs.length,
    data: repairs
  });
});

export const getRepairByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const repair = await getRepairByIdService(id);

  return res.status(200).json({
    status: "success",
    data: repair
  });
});

export const createRepairController = asyncHandler(async (req, res) => {
  const authHeader = req.headers["x-workshop-key"];
  if (!authHeader || authHeader !== process.env.MECHANIC_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere la clave de autorización en el header 'x-workshop-key'.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { ticketCode, clientName, motorcycleModel, serviceType, costUSD, status } = req.body;

  if (!ticketCode || typeof ticketCode !== "string" || ticketCode.trim() === "") {
    throw new BadRequestError("El campo 'ticketCode' es obligatorio.");
  }

  if (!clientName || typeof clientName !== "string" || clientName.trim() === "") {
    throw new BadRequestError("El campo 'clientName' es obligatorio.");
  }

  if (!motorcycleModel || typeof motorcycleModel !== "string" || motorcycleModel.trim() === "") {
    throw new BadRequestError("El campo 'motorcycleModel' es obligatorio.");
  }

  if (!serviceType || typeof serviceType !== "string" || serviceType.trim() === "") {
    throw new BadRequestError("El campo 'serviceType' es obligatorio.");
  }

  const cost = Number(costUSD);
  if (costUSD === undefined || isNaN(cost) || cost <= 0) {
    throw new BadRequestError("El campo 'costUSD' debe ser un número positivo mayor a 0.");
  }

  if (status && !VALID_STATUSES.includes(status.trim())) {
    throw new BadRequestError(`El campo 'status' debe ser uno de: ${VALID_STATUSES.join(", ")}.`);
  }

  const newRepair = await createRepairService({
    ticketCode: ticketCode.trim(),
    clientName: clientName.trim(),
    motorcycleModel: motorcycleModel.trim(),
    serviceType: serviceType.trim(),
    costUSD: cost,
    status: status ? status.trim() : "Pending"
  });

  return res.status(201).json({
    status: "success",
    data: newRepair
  });
});

export const updateRepairController = asyncHandler(async (req, res) => {
  const authHeader = req.headers["x-workshop-key"];
  if (!authHeader || authHeader !== process.env.MECHANIC_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere autorización para modificar órdenes de servicio.");
  }

  const { id } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { ticketCode, clientName, motorcycleModel, serviceType, costUSD, status } = req.body;

  if (!ticketCode || typeof ticketCode !== "string" || ticketCode.trim() === "") {
    throw new BadRequestError("El campo 'ticketCode' es obligatorio.");
  }

  if (!clientName || typeof clientName !== "string" || clientName.trim() === "") {
    throw new BadRequestError("El campo 'clientName' es obligatorio.");
  }

  if (!motorcycleModel || typeof motorcycleModel !== "string" || motorcycleModel.trim() === "") {
    throw new BadRequestError("El campo 'motorcycleModel' es obligatorio.");
  }

  if (!serviceType || typeof serviceType !== "string" || serviceType.trim() === "") {
    throw new BadRequestError("El campo 'serviceType' es obligatorio.");
  }

  const cost = Number(costUSD);
  if (costUSD === undefined || isNaN(cost) || cost <= 0) {
    throw new BadRequestError("El campo 'costUSD' debe ser un número positivo.");
  }

  if (!status || !VALID_STATUSES.includes(status.trim())) {
    throw new BadRequestError(`El campo 'status' es obligatorio y debe ser uno de: ${VALID_STATUSES.join(", ")}.`);
  }

  const updatedRepair = await updateRepairService(id, {
    ticketCode: ticketCode.trim(),
    clientName: clientName.trim(),
    motorcycleModel: motorcycleModel.trim(),
    serviceType: serviceType.trim(),
    costUSD: cost,
    status: status.trim()
  });

  return res.status(200).json({
    status: "success",
    data: updatedRepair
  });
});

export const deleteRepairController = asyncHandler(async (req, res) => {
  const authHeader = req.headers["x-workshop-key"];
  if (!authHeader || authHeader !== process.env.MECHANIC_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere autorización para eliminar órdenes del taller.");
  }

  const { id } = req.params;
  await deleteRepairService(id);

  return res.status(204).send();
});