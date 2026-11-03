import { getSneakers, buscarSneaker } from '../services/sneakers.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'primer servidor Express'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getSneakers() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);
  const sneaker = buscarSneaker(id);

  if (!sneaker) {
    return res.status(404).json({ ok: false, message: 'Sneaker no encontrado' });
  }

  res.json({ ok: true, data: sneaker });
}
