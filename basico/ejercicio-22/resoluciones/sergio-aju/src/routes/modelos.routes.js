import { listarModelos } from '../services/modelos.service.js';

export function obtenerModelos(req, res) {
  const modelos = listarModelos();

  res.json({
    ok: true,
    modelos
  });
}