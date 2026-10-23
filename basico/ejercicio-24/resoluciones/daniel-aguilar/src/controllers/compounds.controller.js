const service = require('../services/compounds.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'CRUD basico',
  });

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('El id debe ser un entero positivo');
    error.status = 400;
    throw error;
  }
  return id;
}

function list(req, res) {
  const { category } = req.query;
  if (category !== undefined && !service.CATEGORIES.includes(category)) {
    return res.status(400).json({ ok: false, message: `category debe ser una de: ${service.CATEGORIES.join(', ')}` });
  }
  const compounds = service.list(category);
  res.json({ ok: true, total: compounds.length, compounds });
}

const detail = (req, res) => res.json({ ok: true, compound: service.get(parseId(req.params.id)) });

const create = (req, res) => {
  const compound = service.create(req.body);
  res.status(201).location(`/compounds/${compound.id}`).json({ ok: true, compound });
};

const update = (req, res) => res.json({ ok: true, compound: service.update(parseId(req.params.id), req.body) });

const remove = (req, res) => {
  service.remove(parseId(req.params.id));
  res.status(204).end();
};

module.exports = { info, list, detail, create, update, remove };
