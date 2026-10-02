import { listarMotos, buscarMoto, validarMoto, crearMoto, actualizarMoto, eliminarMoto } from '../services/motos.service.js';

export function listar(req, res) {
  res.json({ ok: true, data: listarMotos(req.query.marca) });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const moto = buscarMoto(id);

  if (!moto) {
    return res.status(404).json({ ok: false, message: 'Moto no encontrada' });
  }

  res.json({ ok: true, data: moto });
}

export function crear(req, res) {
  const datos = req.body || {};
  const errores = validarMoto(datos);

  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores: errores });
  }

  const nueva = crearMoto(datos);
  res.status(201).json({ ok: true, data: nueva });
}

export function actualizar(req, res) {
  const id = Number(req.params.id);
  const datos = req.body || {};

  if (!buscarMoto(id)) {
    return res.status(404).json({ ok: false, message: 'Moto no encontrada' });
  }

  const errores = validarMoto(datos);

  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores: errores });
  }

  res.json({ ok: true, data: actualizarMoto(id, datos) });
}

export function eliminar(req, res) {
  const id = Number(req.params.id);
  const eliminada = eliminarMoto(id);

  if (!eliminada) {
    return res.status(404).json({ ok: false, message: 'Moto no encontrada' });
  }

  res.json({ ok: true, message: 'Moto eliminada', data: eliminada });
}
