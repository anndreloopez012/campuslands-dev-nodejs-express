import { config } from '../config.js';
import { buscarAuto } from '../services/autos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'variables de entorno'
  });
}

export function verConfig(req, res) {
  res.json({
    ok: true,
    data: {
      appName: config.appName,
      modo: config.modo,
      port: config.port
    }
  });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const auto = buscarAuto(id);

  if (!auto) {
    return res.status(404).json({ ok: false, message: 'Auto no encontrado' });
  }

  res.json({ ok: true, data: auto });
}
