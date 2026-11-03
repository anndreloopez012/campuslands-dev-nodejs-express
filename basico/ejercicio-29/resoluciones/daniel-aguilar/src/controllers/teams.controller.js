const service = require('../services/teams.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'README tecnico',
  });

function list(req, res) {
  const { type } = req.query;
  if (type !== undefined && !service.TYPES.includes(type)) {
    return res.status(400).json({ ok: false, message: `type debe ser uno de: ${service.TYPES.join(', ')}` });
  }
  const teams = service.list(type);
  res.json({ ok: true, total: teams.length, teams });
}

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  res.json({ ok: true, team: service.get(id) });
}

const create = (req, res) => {
  const team = service.create(req.body);
  res.status(201).location(`/teams/${team.id}`).json({ ok: true, team });
};

module.exports = { info, list, detail, create };
