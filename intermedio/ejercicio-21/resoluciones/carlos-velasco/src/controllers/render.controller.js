const renderService = require('../services/render.service');

function listarRenders(req, res) {
  res.status(200).json({ ok: true, data: renderService.listarRenders() });
}

function consultarRend(req, res, next) {
  try {
    return res.status(200).json({ ok: true, data: renderService.consultarRend(Number(req.params.id)) });
  } catch (error) {
    return next(error);
  }
}

function encolarRend(req, res, next) {
  try {
    const render = renderService.encolarRend(req.body);
    return res.status(202).json({ ok: true, message: 'Render encolado', data: render });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarRenders, consultarRend, encolarRend };
