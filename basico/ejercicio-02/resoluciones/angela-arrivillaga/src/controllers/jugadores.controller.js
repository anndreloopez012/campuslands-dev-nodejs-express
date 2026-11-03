import { getScripts, buscarJugador } from '../services/jugadores.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'npm scripts y package.json'
  });
}

export function listarScripts(req, res) {
  res.json({ ok: true, data: getScripts() });
}

export function obtenerJugador(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const jugador = buscarJugador(id);

  if (!jugador) {
    return res.status(404).json({ ok: false, message: 'Jugador no encontrado' });
  }

  res.json({ ok: true, data: jugador });
}
