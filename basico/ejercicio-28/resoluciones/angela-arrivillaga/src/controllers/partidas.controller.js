import { config } from '../config.js';
import { getPartidas, buscarPartida } from '../services/partidas.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'configuracion por entorno'
  });
}

export function verConfig(req, res) {
  res.json({
    ok: true,
    data: {
      appName: config.appName,
      entorno: config.entorno,
      port: config.port,
      debug: config.debug
    }
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getPartidas() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const partida = buscarPartida(id);

  if (!partida) {
    return res.status(404).json({ ok: false, message: 'Partida no encontrada' });
  }

  res.json({ ok: true, data: partida });
}
