const service = require('../services/fighters.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'JSON y persistencia simple',
  });

async function list(req, res, next) {
  try {
    const fighters = await service.listFighters();
    res.json({ ok: true, total: fighters.length, fighters });
  } catch (error) {
    next(error);
  }
}

async function detail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
    }
    const fighter = await service.getFighter(id);
    if (!fighter) return res.status(404).json({ ok: false, message: 'Peleador no encontrado' });
    res.json({ ok: true, fighter });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const fighter = await service.createFighter(req.body);
    res.status(201).json({ ok: true, fighter });
  } catch (error) {
    next(error);
  }
}

module.exports = { info, list, detail, create };
