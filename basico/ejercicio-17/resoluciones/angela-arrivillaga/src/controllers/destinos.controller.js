import { getDestinos, getPopulares, getPaises, buscarDestino } from '../services/destinos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas GET'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getDestinos() });
}

export function populares(req, res) {
  res.json({ ok: true, data: getPopulares() });
}

export function paises(req, res) {
  res.json({ ok: true, data: getPaises() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const destino = buscarDestino(id);

  if (!destino) {
    return res.status(404).json({ ok: false, message: 'Destino no encontrado' });
  }

  res.json({ ok: true, data: destino });
}
