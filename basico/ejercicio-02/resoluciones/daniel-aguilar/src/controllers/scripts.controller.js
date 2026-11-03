const service = require('../services/package.service');

function health(req, res) {
  res.json({ ok: true, status: 'up' });
}

function info(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'npm scripts y package.json',
    project: service.getInfo(),
  });
}

function listScripts(req, res) {
  const scripts = service.listScripts();
  res.json({ ok: true, total: scripts.length, scripts });
}

function getScript(req, res) {
  const script = service.findScript(req.params.name);
  if (!script) {
    return res.status(404).json({ ok: false, message: `El script "${req.params.name}" no existe en package.json` });
  }
  res.json({ ok: true, script });
}

module.exports = { health, info, listScripts, getScript };
