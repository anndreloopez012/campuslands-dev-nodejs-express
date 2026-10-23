import { listarDestinos } from '../services/destinos.service.js';

export function obtenerDestinos(req, res) {
  const destinos = listarDestinos();

  res.json({
    ok: true,
    destinos
  });
}