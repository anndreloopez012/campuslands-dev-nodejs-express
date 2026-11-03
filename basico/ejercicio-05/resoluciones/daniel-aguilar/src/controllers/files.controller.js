const service = require('../services/files.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'fs para leer archivos',
  });

async function matches(req, res, next) {
  try {
    const data = await service.getMatches();
    res.json({ ok: true, total: data.length, matches: data });
  } catch (error) {
    next(error);
  }
}

async function stadiums(req, res, next) {
  try {
    const data = await service.getStadiums();
    res.json({ ok: true, total: data.length, stadiums: data });
  } catch (error) {
    next(error);
  }
}

async function fileInfo(req, res, next) {
  try {
    res.json({ ok: true, file: await service.getFileInfo(req.params.name) });
  } catch (error) {
    next(error);
  }
}

module.exports = { info, matches, stadiums, fileInfo };
