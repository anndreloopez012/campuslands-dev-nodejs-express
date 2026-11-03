const service = require('../services/jumps.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas POST',
  });

const list = (req, res) => {
  const jumps = service.listJumps();
  res.json({ ok: true, total: jumps.length, jumps });
};

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  const jump = service.getJump(id);
  if (!jump) return res.status(404).json({ ok: false, message: 'Salto no encontrado' });
  res.json({ ok: true, jump });
}

function create(req, res) {
  const errors = service.validateJump(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ ok: false, message: 'Datos invalidos', errors });
  }
  const jump = service.createJump(req.body);
  // 201 Created + cabecera Location apuntando al nuevo recurso
  res.status(201).location(`/jumps/${jump.id}`).json({ ok: true, jump });
}

module.exports = { info, list, detail, create };
