import {
  listarAnimaciones,
  guardarAnimacion
} from '../services/animaciones.service.js';

export function obtenerAnimaciones(req, res) {
  const animaciones = listarAnimaciones();

  res.json({
    ok: true,
    animaciones
  });
}

export function crearAnimacion(req, res) {
  const { nombre, tipo } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({
      ok: false,
      message: 'El nombre y el tipo son obligatorios'
    });
  }

  const animacion = guardarAnimacion(nombre, tipo);

  res.status(201).json({
    ok: true,
    animacion
  });
}