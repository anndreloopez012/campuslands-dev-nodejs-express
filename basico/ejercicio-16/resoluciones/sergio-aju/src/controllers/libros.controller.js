import { listarRopa } from '../services/ropa.service.js';

export function obtenerRopa(req, res) {
  const ropa = listarRopa();

  res.json({
    ok: true,
    ropa
  });
}