import * as hyperService from "../services/hypercars.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-factory-key"];
  if (!key || key !== process.env.FACTORY_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere clave de telemetría en 'x-factory-key'.");
  }
};

export const getHypercarsController = asyncHandler(async (req, res) => {
  const hypercars = await hyperService.getAllHypercarsService(req.query);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: hypercars.length,
    data: hypercars
  });
});

export const getHypercarByIdController = asyncHandler(async (req, res) => {
  const hypercar = await hyperService.getHypercarByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: hypercar
  });
});

export const createHypercarController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const newHypercar = await hyperService.registerHypercarService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    data: newHypercar
  });
});

export const deleteHypercarController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  await hyperService.deleteHypercarService(req.params.id);
  return res.status(204).send();
});