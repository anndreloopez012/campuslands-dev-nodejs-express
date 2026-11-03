const service = require('../services/movies.service');
const { asyncHandler } = require('../utils/async-handler');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'async await',
  });

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const detail = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });

  const movie = await service.getMovieDetail(id);
  res.json({ ok: true, movie });
});

// Version explicita con try/catch, para comparar con asyncHandler.
async function benchmark(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
    res.json({ ok: true, ...(await service.benchmark(id)) });
  } catch (error) {
    next(error);
  }
}

module.exports = { info, detail, benchmark };
