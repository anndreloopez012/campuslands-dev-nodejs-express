import {
  listHeroesV2Service,
  getHeroByIdV2Service,
  createHeroV2Service
} from "../../services/heroes.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getHeroesV2 = asyncHandler(async (req, res) => {
  const data = await listHeroesV2Service(req.query);

  res.status(200).json({
    ok: true,
    apiVersion: "v2",
    topic: "diseno API versionada",
    meta: {
      total: data.length,
      filtersApplied: req.query
    },
    data
  });
});

export const getHeroByIdV2 = asyncHandler(async (req, res) => {
  const data = await getHeroByIdV2Service(req.params.id);

  res.status(200).json({
    ok: true,
    apiVersion: "v2",
    data
  });
});

export const createHeroV2 = asyncHandler(async (req, res) => {
  const data = await createHeroV2Service(req.body);

  res.status(201).json({
    ok: true,
    apiVersion: "v2",
    message: "Héroe registrado con estadísticas anidadas y combatRating (v2).",
    data
  });
});
