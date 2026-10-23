import { guardarParacaidista } from '../services/paracaidistas.service.js';

export function crearParacaidista(req, res) {
  const { nombre, nivel } = req.body;

  if (!nombre || !nivel) {
    return res.status(400).json({
      ok: false,
      message: 'El nombre y el nivel son obligatorios'
    });
  }

  const paracaidista = guardarParacaidista(nombre, nivel);

  res.status(201).json({
    ok: true,
    paracaidista
  });
}