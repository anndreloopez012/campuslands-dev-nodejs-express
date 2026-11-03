import * as repo from "../repositories/jobs.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La tarea mecánica '${id}' no existe en la cola.`);
  return item;
};

export const createItemService = async (payload) => {
  const { bikeModel, taskType } = payload || {};
  if (!bikeModel || !taskType) {
    throw new BadRequestError("Se requiere 'bikeModel' y 'taskType' para encolar el diagnóstico mecánico.");
  }
  const all = await repo.findAll();
  const job = await repo.save({
    id: `JOB-0${all.length + 1}`,
    bikeModel: bikeModel.trim(),
    taskType: taskType.trim(),
    status: "PENDING_IN_QUEUE",
    enqueuedAt: new Date().toISOString(),
    resultHp: null
  });

  // Procesamiento diferido simulado en el Event Loop
  setTimeout(() => {
    job.status = "COMPLETED";
    job.resultHp = 185 + Math.floor(Math.random() * 30);
    job.completedAt = new Date().toISOString();
  }, 50);

  return job;
};
