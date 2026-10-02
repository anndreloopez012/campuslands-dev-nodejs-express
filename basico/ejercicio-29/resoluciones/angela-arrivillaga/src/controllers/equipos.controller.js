import { getEquipos, buscarEquipo, agregarEquipo } from '../services/equipos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'README tecnico'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getEquipos() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const equipo = buscarEquipo(id);

  if (!equipo) {
    return res.status(404).json({ ok: false, message: 'Equipo no encontrado' });
  }

  res.json({ ok: true, data: equipo });
}

export function crear(req, res) {
  const body = req.body || {};

  if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
    return res.status(400).json({ ok: false, message: 'El nombre es obligatorio' });
  }

  if (typeof body.ciudad !== 'string' || body.ciudad.trim() === '') {
    return res.status(400).json({ ok: false, message: 'La ciudad es obligatoria' });
  }

  if (!Number.isInteger(body.jugadores) || body.jugadores < 5) {
    return res.status(400).json({ ok: false, message: 'Los jugadores deben ser un entero de al menos 5' });
  }

  const nuevo = agregarEquipo(body.nombre.trim(), body.ciudad.trim(), body.jugadores);
  res.status(201).json({ ok: true, data: nuevo });
}
