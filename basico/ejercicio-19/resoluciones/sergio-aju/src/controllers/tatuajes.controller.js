import {
  buscarPorId,
  buscarPorEstilo
} from '../services/tatuajes.service.js';

export function obtenerTatuaje(req, res) {
  const tatuaje = buscarPorId(req.params.id);

  if (!tatuaje) {
    return res.status(404).json({
      ok: false,
      message: 'Tatuaje no encontrado'
    });
  }

  res.json({
    ok: true,
    tatuaje
  });
}

export function buscarTatuajes(req, res) {
  const estilo = req.query.estilo;

  const tatuajes = buscarPorEstilo(estilo);

  res.json({
    ok: true,
    tatuajes
  });
}