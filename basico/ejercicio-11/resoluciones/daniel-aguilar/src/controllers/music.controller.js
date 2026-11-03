const service = require('../services/music.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'promesas basicas',
  });

function detail(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  service
    .getAlbumDetail(id)
    .then((album) => res.json({ ok: true, album }))
    .catch(next);
}

function summary(req, res, next) {
  service
    .getCatalogSummary()
    .then((data) => res.json({ ok: true, ...data }))
    .catch(next);
}

function batch(req, res, next) {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (ids.length === 0) {
    return res.status(400).json({ ok: false, message: 'Envia ids validos, por ejemplo ?ids=1,2,99' });
  }
  service
    .getAlbumsBatch(ids)
    .then((results) => res.json({ ok: true, results }))
    .catch(next);
}

const stats = (req, res) => res.json({ ok: true, ...service.getStats() });

module.exports = { info, detail, summary, batch, stats };
