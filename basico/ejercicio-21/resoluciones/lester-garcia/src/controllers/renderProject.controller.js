import {
  getProjectsService,
  getProjectByIdService,
  createProjectService
} from "../services/renderProject.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_STATUSES = ["Queued", "In Progress", "Completed", "Paused"];
const VALID_RESOLUTIONS = ["1080p", "1440p", "4K", "8K"];

export const getProjectsController = asyncHandler(async (req, res) => {
  const { software, renderEngine, status } = req.query;

  if (status && !VALID_STATUSES.map(s => s.toLowerCase()).includes(status.toLowerCase())) {
    throw new BadRequestError(`El filtro 'status' es inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}.`);
  }

  const projects = await getProjectsService({ software, renderEngine, status });

  return res.status(200).json({
    status: "success",
    results: projects.length,
    queryParams: req.query,
    data: projects
  });
});

export const getProjectByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    throw new BadRequestError("El parámetro de ruta 'id' es obligatorio.");
  }

  const project = await getProjectByIdService(id);

  return res.status(200).json({
    status: "success",
    routeParams: req.params,
    data: project
  });
});

export const createProjectController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { title, studio, software, renderEngine, totalFrames, resolution, estimatedCostUSD, status } = req.body;

  // Validaciones primarias
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new BadRequestError("El campo 'title' es obligatorio.");
  }

  if (!studio || typeof studio !== "string" || studio.trim() === "") {
    throw new BadRequestError("El campo 'studio' es obligatorio.");
  }

  if (!software || typeof software !== "string" || software.trim() === "") {
    throw new BadRequestError("El campo 'software' (ej. Blender, Maya, Houdini) es obligatorio.");
  }

  if (!renderEngine || typeof renderEngine !== "string" || renderEngine.trim() === "") {
    throw new BadRequestError("El campo 'renderEngine' (ej. Cycles, Arnold, Redshift) es obligatorio.");
  }

  const frames = Number(totalFrames);
  if (totalFrames === undefined || isNaN(frames) || frames <= 0) {
    throw new BadRequestError("El campo 'totalFrames' debe ser un entero positivo.");
  }

  if (!resolution || !VALID_RESOLUTIONS.includes(resolution)) {
    throw new BadRequestError(`El campo 'resolution' debe ser uno de los siguientes: ${VALID_RESOLUTIONS.join(", ")}.`);
  }

  const cost = Number(estimatedCostUSD);
  if (estimatedCostUSD === undefined || isNaN(cost) || cost <= 0) {
    throw new BadRequestError("El campo 'estimatedCostUSD' debe ser un número mayor a 0.");
  }

  if (status && !VALID_STATUSES.includes(status)) {
    throw new BadRequestError(`El campo 'status' debe ser uno de los siguientes: ${VALID_STATUSES.join(", ")}.`);
  }

  const newProject = await createProjectService({
    title: title.trim(),
    studio: studio.trim(),
    software: software.trim(),
    renderEngine: renderEngine.trim(),
    totalFrames: frames,
    resolution,
    estimatedCostUSD: cost,
    status
  });

  return res.status(201).json({
    status: "success",
    data: newProject
  });
});