import * as renderJobsRepo from "../repositories/renderJobs.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getAllRenderJobsService = async () => {
  return await renderJobsRepo.findAllRenderJobs();
};

export const getRenderJobByIdService = async (id) => {
  const job = await renderJobsRepo.findRenderJobById(id);
  if (!job) {
    throw new NotFoundError(`El trabajo de renderizado con ID '${id}' no existe en la cola.`);
  }
  return job;
};

export const enqueueRenderJobService = async (payload) => {
  const all = await renderJobsRepo.findAllRenderJobs();
  const nextId = `RND-${String(all.length + 1).padStart(2, "0")}`;

  const newJob = {
    id: nextId,
    sceneName: payload.sceneName.trim(),
    animator: payload.animator.trim(),
    renderEngine: payload.renderEngine.trim(),
    totalFrames: Number(payload.totalFrames),
    samplesPerPixel: Number(payload.samplesPerPixel),
    status: "En_Cola",
    createdAt: new Date().toISOString()
  };

  return await renderJobsRepo.saveRenderJob(newJob);
};
