import {
  listHeroesV1Service,
  getHeroByIdV1Service,
  createHeroV1Service
} from "../../services/heroes.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getHeroesV1 = asyncHandler(async (req, res) => {
  const data = await listHeroesV1Service(req.query);

  res.status(200).json({
    ok: true,
    apiVersion: "v1",
    deprecated: true,
    notice: "La versión v1 tiene formato plano legado. Migra a /api/v2/heroes para estadísticas avanzadas.",
    count: data.length,
    data
  });
});

export const getHeroByIdV1 = asyncHandler(async (req, res) => {
  const data = await getHeroByIdV1Service(req.params.id);

  res.status(200).json({
    ok: true,
    apiVersion: "v1",
    deprecated: true,
    data
  });
});

export const createHeroV1 = asyncHandler(async (req, res) => {
  const data = await createHeroV1Service(req.body);

  res.status(201).json({
    ok: true,
    apiVersion: "v1",
    message: "Héroe registrado con contrato legado v1.",
    data
  });
});
