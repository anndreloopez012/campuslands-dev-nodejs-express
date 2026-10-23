import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/renderProjects.json");

const readProjectsFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeProjectsFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getProjectsService = async (filters = {}) => {
  let projects = await readProjectsFile();
  const { software, renderEngine, status } = filters;

  if (software) {
    projects = projects.filter(
      (p) => p.software.toLowerCase() === software.toLowerCase()
    );
  }

  if (renderEngine) {
    projects = projects.filter(
      (p) => p.renderEngine.toLowerCase() === renderEngine.toLowerCase()
    );
  }

  if (status) {
    projects = projects.filter(
      (p) => p.status.toLowerCase() === status.toLowerCase()
    );
  }

  return projects;
};

export const getProjectByIdService = async (id) => {
  const projects = await readProjectsFile();
  const project = projects.find((p) => p.id === String(id));

  if (!project) {
    throw new NotFoundError(`El proyecto de renderizado con ID '${id}' no existe.`);
  }

  return project;
};

export const createProjectService = async ({
  title,
  studio,
  software,
  renderEngine,
  totalFrames,
  resolution,
  estimatedCostUSD,
  status
}) => {
  const projects = await readProjectsFile();

  const titleExists = projects.some(
    (p) => p.title.toLowerCase() === title.toLowerCase() && p.studio.toLowerCase() === studio.toLowerCase()
  );

  if (titleExists) {
    throw new ConflictError(
      `El proyecto '${title}' ya se encuentra registrado para el estudio '${studio}'.`
    );
  }

  const newProject = {
    id: String(Date.now()),
    title,
    studio,
    software,
    renderEngine,
    totalFrames: Number(totalFrames),
    resolution,
    estimatedCostUSD: Number(estimatedCostUSD),
    status: status || "Queued"
  };

  projects.push(newProject);
  await writeProjectsFile(projects);

  return newProject;
};