import {
  getArchvizProjectsService,
  getArchvizProjectByIdService,
  createArchvizProjectService,
  getArchvizStatsService
} from "../services/archviz.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_SOFTWARES = ["3ds Max", "Revit", "Rhinoceros", "SketchUp", "Blender"];

export const getArchvizProjectsController = asyncHandler(async (req, res) => {
  const { style, software, isVRReady, maxBudget } = req.query;

  if (maxBudget !== undefined && (isNaN(Number(maxBudget)) || Number(maxBudget) <= 0)) {
    throw new BadRequestError("El parámetro 'maxBudget' debe ser un número positivo.");
  }

  const projects = await getArchvizProjectsService({ style, software, isVRReady, maxBudget });

  return res.status(200).json({
    status: "success",
    total: projects.length,
    data: projects
  });
});

export const getArchvizProjectByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await getArchvizProjectByIdService(id);

  return res.status(200).json({
    status: "success",
    data: project
  });
});

export const createArchvizProjectController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const {
    projectName,
    architecturalStyle,
    software,
    renderEngine,
    areaSqMeters,
    budgetUSD,
    rendersCount,
    isVRReady,
    status
  } = req.body;

  if (!projectName || typeof projectName !== "string" || projectName.trim() === "") {
    throw new BadRequestError("El campo 'projectName' es obligatorio.");
  }

  if (!architecturalStyle || typeof architecturalStyle !== "string" || architecturalStyle.trim() === "") {
    throw new BadRequestError("El campo 'architecturalStyle' es obligatorio.");
  }

  if (!software || !VALID_SOFTWARES.includes(software.trim())) {
    throw new BadRequestError(`El campo 'software' debe ser uno de los siguientes: ${VALID_SOFTWARES.join(", ")}.`);
  }

  if (!renderEngine || typeof renderEngine !== "string" || renderEngine.trim() === "") {
    throw new BadRequestError("El campo 'renderEngine' es obligatorio.");
  }

  const area = Number(areaSqMeters);
  if (areaSqMeters === undefined || isNaN(area) || area <= 0) {
    throw new BadRequestError("El campo 'areaSqMeters' debe ser un número positivo.");
  }

  const budget = Number(budgetUSD);
  if (budgetUSD === undefined || isNaN(budget) || budget <= 0) {
    throw new BadRequestError("El campo 'budgetUSD' debe ser un número positivo.");
  }

  const renders = Number(rendersCount);
  if (rendersCount === undefined || isNaN(renders) || renders <= 0) {
    throw new BadRequestError("El campo 'rendersCount' debe ser un entero positivo.");
  }

  const newProject = await createArchvizProjectService({
    projectName: projectName.trim(),
    architecturalStyle: architecturalStyle.trim(),
    software: software.trim(),
    renderEngine: renderEngine.trim(),
    areaSqMeters: area,
    budgetUSD: budget,
    rendersCount: renders,
    isVRReady,
    status
  });

  return res.status(201).json({
    status: "success",
    data: newProject
  });
});

export const getArchvizStatsController = asyncHandler(async (req, res) => {
  const stats = await getArchvizStatsService();

  return res.status(200).json({
    status: "success",
    data: stats
  });
});