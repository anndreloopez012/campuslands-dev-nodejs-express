import { getCampeones, buscarCampeon } from '../services/campeones.service.js';
import { leerLogs } from '../services/log.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'logs simples'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getCampeones() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const campeon = buscarCampeon(id);

  if (!campeon) {
    return res.status(404).json({ ok: false, message: 'Campeon no encontrado' });
  }

  res.json({ ok: true, data: campeon });
}

export function verLogs(req, res) {
  res.json({ ok: true, data: leerLogs() });
}
