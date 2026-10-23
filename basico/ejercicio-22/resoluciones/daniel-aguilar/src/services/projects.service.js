// La capa de SERVICIOS contiene la logica de negocio. No conoce req ni res.
const QUALITY_MULTIPLIER = { draft: 0.5, standard: 1, high: 2.5 };
const PROJECT_TYPES = ['residencial', 'comercial', 'industrial', 'paisajismo'];

const projects = [
  { id: 1, name: 'Casa Los Cedros', type: 'residencial', polygons: 240000, lights: 6 },
  { id: 2, name: 'Torre Central', type: 'comercial', polygons: 1250000, lights: 24 },
  { id: 3, name: 'Parque Lineal', type: 'paisajismo', polygons: 600000, lights: 3 },
];

function serviceError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

const listProjects = () => projects.map((project) => ({ ...project }));

function getProject(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) throw serviceError(404, `El proyecto ${id} no existe`);
  return { ...project };
}

function createProject(data) {
  const details = [];
  if (typeof data?.name !== 'string' || data.name.trim().length < 2) details.push('name debe tener al menos 2 caracteres');
  if (!PROJECT_TYPES.includes(data?.type)) details.push(`type debe ser uno de: ${PROJECT_TYPES.join(', ')}`);
  if (!Number.isInteger(data?.polygons) || data.polygons < 1000) details.push('polygons debe ser un entero mayor o igual a 1000');
  if (!Number.isInteger(data?.lights) || data.lights < 0 || data.lights > 200) details.push('lights debe ser un entero entre 0 y 200');
  if (details.length > 0) throw serviceError(400, 'Datos invalidos', details);

  const project = {
    id: projects.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    name: data.name.trim(),
    type: data.type,
    polygons: data.polygons,
    lights: data.lights,
  };
  projects.push(project);
  return { ...project };
}

/**
 * Regla de negocio: minutos estimados de render.
 *   minutos = ceil( (poligonos / 100.000) * multiplicador(calidad) * (1 + luces * 0.1) )
 */
function estimateRender(project, quality = 'standard') {
  const multiplier = QUALITY_MULTIPLIER[quality];
  if (multiplier === undefined) {
    throw serviceError(400, `quality debe ser uno de: ${Object.keys(QUALITY_MULTIPLIER).join(', ')}`);
  }
  const minutes = Math.ceil((project.polygons / 100000) * multiplier * (1 + project.lights * 0.1));
  return { projectId: project.id, quality, minutes, hours: Number((minutes / 60).toFixed(2)) };
}

function getRenderEstimate(id, quality) {
  return estimateRender(getProject(id), quality);
}

function getSummary() {
  const byType = {};
  let totalPolygons = 0;
  for (const project of projects) {
    byType[project.type] = (byType[project.type] || 0) + 1;
    totalPolygons += project.polygons;
  }
  return { totalProjects: projects.length, totalPolygons, byType };
}

module.exports = { listProjects, getProject, createProject, estimateRender, getRenderEstimate, getSummary };
