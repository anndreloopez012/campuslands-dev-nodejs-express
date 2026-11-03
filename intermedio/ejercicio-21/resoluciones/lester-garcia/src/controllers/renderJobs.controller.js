import * as renderJobsService from "../services/renderJobs.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllRenderJobsController = asyncHandler(async (req, res) => {
  const jobs = await renderJobsService.getAllRenderJobsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: jobs.length,
    data: jobs
  });
});

export const getRenderJobByIdController = asyncHandler(async (req, res) => {
  const job = await renderJobsService.getRenderJobByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: job
  });
});

export const enqueueRenderJobController = asyncHandler(async (req, res) => {
  const created = await renderJobsService.enqueueRenderJobService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Escena 3D encolada en la granja de renderizado.",
    data: created
  });
});
