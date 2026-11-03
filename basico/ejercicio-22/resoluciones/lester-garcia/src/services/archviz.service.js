import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/archvizProjects.json");

const readArchvizFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeArchvizFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

// Servicio 1: Obtener proyectos con filtrado dinámico
export const getArchvizProjectsService = async (filters = {}) => {
  let projects = await readArchvizFile();
  const { style, software, isVRReady, maxBudget } = filters;

  if (style) {
    projects = projects.filter((p) =>
      p.architecturalStyle.toLowerCase().includes(style.toLowerCase())
    );
  }

  if (software) {
    projects = projects.filter(
      (p) => p.software.toLowerCase() === software.toLowerCase()
    );
  }

  if (isVRReady !== undefined) {
    const vrBoolean = isVRReady === "true";
    projects = projects.filter((p) => p.isVRReady === vrBoolean);
  }

  if (maxBudget) {
    const numericBudget = Number(maxBudget);
    projects = projects.filter((p) => p.budgetUSD <= numericBudget);
  }

  return projects;
};

// Servicio 2: Obtener proyecto por ID con cálculo derivado
export const getArchvizProjectByIdService = async (id) => {
  const projects = await readArchvizFile();
  const project = projects.find((p) => p.id === String(id));

  if (!project) {
    throw new NotFoundError(`El proyecto de arquitectura 3D con ID '${id}' no existe.`);
  }

  // Lógica de servicio: Cálculo de costo estimado por metro cuadrado
  const costPerSqMeter = Number((project.budgetUSD / project.areaSqMeters).toFixed(2));

  return {
    ...project,
    metrics: {
      costPerSqMeter
    }
  };
};

// Servicio 3: Crear proyecto verificando duplicados
export const createArchvizProjectService = async ({
  projectName,
  architecturalStyle,
  software,
  renderEngine,
  areaSqMeters,
  budgetUSD,
  rendersCount,
  isVRReady,
  status
}) => {
  const projects = await readArchvizFile();

  const nameExists = projects.some(
    (p) => p.projectName.toLowerCase() === projectName.toLowerCase()
  );

  if (nameExists) {
    throw new ConflictError(`El proyecto '${projectName}' ya existe en el portafolio del estudio.`);
  }

  const newProject = {
    id: String(Date.now()),
    projectName,
    architecturalStyle,
    software,
    renderEngine,
    areaSqMeters: Number(areaSqMeters),
    budgetUSD: Number(budgetUSD),
    rendersCount: Number(rendersCount),
    isVRReady: isVRReady !== undefined ? Boolean(isVRReady) : false,
    status: status || "In Development"
  };

  projects.push(newProject);
  await writeArchvizFile(projects);

  return newProject;
};

// Servicio 4: Métricas generales del estudio
export const getArchvizStatsService = async () => {
  const projects = await readArchvizFile();

  const totalProjects = projects.length;
  const vrReadyProjects = projects.filter((p) => p.isVRReady).length;
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budgetUSD, 0);

  return {
    totalProjects,
    vrReadyProjects,
    totalBudgetUSD: totalBudget,
    averageBudgetUSD: totalProjects > 0 ? Number((totalBudget / totalProjects).toFixed(2)) : 0
  };
};