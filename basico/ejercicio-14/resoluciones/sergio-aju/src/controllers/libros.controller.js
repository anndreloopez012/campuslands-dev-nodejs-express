import { guardarLibro } from '../services/libros.service.js';

export function crearLibro(req, res) {
  const { titulo, autor } = req.body;

  if (!titulo || !autor) {
    return res.status(400).json({
      ok: false,
      message: 'El titulo y el autor son obligatorios'
    });
  }

  const libro = guardarLibro(titulo, autor);

  res.status(201).json({
    ok: true,
    libro
  });
}