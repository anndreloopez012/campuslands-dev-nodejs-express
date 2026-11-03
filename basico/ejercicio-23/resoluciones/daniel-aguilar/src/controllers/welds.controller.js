const service = require('../services/welds.service');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'datos en memoria',
  });

function list(req, res) {
  const { process: weldProcess, status } = req.query;
  if (weldProcess !== undefined && !service.PROCESSES.includes(weldProcess)) {
    return res.status(400).json({ ok: false, message: `process debe ser uno de: ${service.PROCESSES.join(', ')}` });
  }
  if (status !== undefined && !service.STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, message: `status debe ser uno de: ${service.STATUSES.join(', ')}` });
  }
  const welds = service.listWelds({ process: weldProcess, status });
  res.json({ ok: true, total: welds.length, welds });
}

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  res.json({ ok: true, weld: service.getWeld(id) });
}

const create = (req, res) => {
  const weld = service.createWeld(req.body);
  res.status(201).location(`/welds/${weld.id}`).json({ ok: true, weld });
};

const stats = (req, res) => res.json({ ok: true, stats: service.getStats() });

// Solo para practicar: restaura los datos iniciales sin reiniciar el servidor.
const reset = (req, res) => {
  service.resetData();
  res.json({ ok: true, message: 'Datos restaurados' });
};

module.exports = { info, list, detail, create, stats, reset };
