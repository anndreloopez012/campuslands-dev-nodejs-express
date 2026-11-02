import {
  listarSoldadores,
  guardarSoldador
} from '../services/soldadores.service.js';

export function obtenerSoldadores(req, res) {
  const soldadores = listarSoldadores();

  res.json({
    ok: true,
    soldadores
  });
}

export function crearSoldador(req, res) {
  const { nombre, especialidad } = req.body;

  if (!nombre || !especialidad) {
    return res.status(400).json({
      ok: false,
      message: 'El nombre y la especialidad son obligatorios'
    });
  }

  const soldador = guardarSoldador(nombre, especialidad);

  res.status(201).json({
    ok: true,
    soldador
  });
}