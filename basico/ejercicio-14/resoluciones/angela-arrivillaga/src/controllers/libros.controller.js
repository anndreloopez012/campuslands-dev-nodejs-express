import { getLibros, validarLibro, agregarLibro } from '../services/libros.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'validacion de entrada'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getLibros() });
}

export function crear(req, res) {
  const datos = req.body || {};
  const errores = validarLibro(datos);

  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores: errores });
  }

  const nuevo = agregarLibro(datos);
  res.status(201).json({ ok: true, data: nuevo });
}
