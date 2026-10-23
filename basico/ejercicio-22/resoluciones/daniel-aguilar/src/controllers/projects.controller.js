// El controlador es delgado: traduce HTTP -> llamada al servicio -> HTTP.
// Los errores que lanza el servicio (con .status) los atiende el middleware de errores de app.js.
const service = require('../services/projects.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'servicios simples',
  });

const list = (req, res) => {
  const projects = service.listProjects();
  res.json({ ok: true, total: projects.length, projects });
};

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('El id debe ser un entero positivo');
    error.status = 400;
    throw error;
  }
  return id;
}

const detail = (req, res) => res.json({ ok: true, project: service.getProject(parseId(req.params.id)) });

const create = (req, res) => res.status(201).json({ ok: true, project: service.createProject(req.body) });

const renderEstimate = (req, res) =>
  res.json({ ok: true, estimate: service.getRenderEstimate(parseId(req.params.id), req.query.quality) });

const summary = (req, res) => res.json({ ok: true, summary: service.getSummary() });

module.exports = { info, list, detail, create, renderEstimate, summary };
