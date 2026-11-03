import { getAnimaciones, buscarAnimacion } from '../services/animaciones.service.js';

export function listar(req, res) {
  res.json({ ok: true, data: getAnimaciones() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const animacion = buscarAnimacion(id);

  if (!animacion) {
    return res.status(404).json({ ok: false, message: 'Animacion no encontrada' });
  }

  res.json({ ok: true, data: animacion });
}
