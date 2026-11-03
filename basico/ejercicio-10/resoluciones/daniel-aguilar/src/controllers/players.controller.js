const service = require('../services/players.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'funciones asincronas',
  });

async function detail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
    }
    const player = await service.getPlayer(id);
    if (!player) return res.status(404).json({ ok: false, message: 'Jugador no encontrado' });
    res.json({ ok: true, player });
  } catch (error) {
    next(error);
  }
}

async function ranking(req, res, next) {
  try {
    const startedAt = Date.now();
    const data = await service.getRanking();
    res.json({ ok: true, elapsedMs: Date.now() - startedAt, ranking: data });
  } catch (error) {
    next(error);
  }
}

async function eventLoop(req, res, next) {
  try {
    res.json({ ok: true, order: await service.eventLoopOrder() });
  } catch (error) {
    next(error);
  }
}

module.exports = { info, detail, ranking, eventLoop };
