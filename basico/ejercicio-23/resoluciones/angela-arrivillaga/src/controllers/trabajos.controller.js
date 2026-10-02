import { listarTrabajos, buscarTrabajo, agregarTrabajo, contarPorEstado } from '../services/trabajos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'datos en memoria'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: listarTrabajos(req.query.estado) });
}

export function estadisticas(req, res) {
  res.json({ ok: true, data: contarPorEstado() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const trabajo = buscarTrabajo(id);

  if (!trabajo) {
    return res.status(404).json({ ok: false, message: 'Trabajo no encontrado' });
  }

  res.json({ ok: true, data: trabajo });
}

export function crear(req, res) {
  const body = req.body || {};
  const tiposValidos = ['MIG', 'TIG', 'electrodo'];

  if (typeof body.cliente !== 'string' || body.cliente.trim() === '') {
    return res.status(400).json({ ok: false, message: 'El cliente es obligatorio' });
  }

  if (!tiposValidos.includes(body.tipo)) {
    return res.status(400).json({ ok: false, message: 'El tipo debe ser MIG, TIG o electrodo' });
  }

  if (typeof body.horas !== 'number' || body.horas <= 0) {
    return res.status(400).json({ ok: false, message: 'Las horas deben ser un numero mayor a 0' });
  }

  const nuevo = agregarTrabajo(body.cliente.trim(), body.tipo, body.horas);
  res.status(201).json({ ok: true, data: nuevo });
}
