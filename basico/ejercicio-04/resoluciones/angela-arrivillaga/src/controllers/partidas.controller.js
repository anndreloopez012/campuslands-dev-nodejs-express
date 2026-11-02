import { getJugadores } from '../services/partidas.service.js';
import calcularPuntaje, { esPosicionValida } from '../utils/puntaje.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'modulos ES Modules'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getJugadores() });
}

export function puntaje(req, res) {
  const kills = Number(req.query.kills);
  const posicion = Number(req.query.posicion);

  if (Number.isNaN(kills) || Number.isNaN(posicion)) {
    return res.status(400).json({ ok: false, message: 'kills y posicion deben ser numeros' });
  }

  if (!esPosicionValida(posicion)) {
    return res.status(400).json({ ok: false, message: 'La posicion debe estar entre 1 y 100' });
  }

  res.json({ ok: true, puntaje: calcularPuntaje(kills, posicion) });
}
