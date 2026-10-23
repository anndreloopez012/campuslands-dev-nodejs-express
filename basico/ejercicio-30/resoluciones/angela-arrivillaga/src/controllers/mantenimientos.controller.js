import { buscarMoto } from '../services/motos.service.js';
import { getMantenimientosDeMoto, agregarMantenimiento } from '../services/mantenimientos.service.js';

export function listarMantenimientos(req, res) {
  const motoId = Number(req.params.id);
  const moto = buscarMoto(motoId);

  if (!moto) {
    return res.status(404).json({ ok: false, message: 'Moto no encontrada' });
  }

  res.json({ ok: true, moto: moto.marca + ' ' + moto.modelo, data: getMantenimientosDeMoto(motoId) });
}

export function crearMantenimiento(req, res) {
  const motoId = Number(req.params.id);
  const body = req.body || {};

  if (!buscarMoto(motoId)) {
    return res.status(404).json({ ok: false, message: 'Moto no encontrada' });
  }

  if (typeof body.descripcion !== 'string' || body.descripcion.trim() === '') {
    return res.status(400).json({ ok: false, message: 'La descripcion es obligatoria' });
  }

  if (typeof body.costo !== 'number' || body.costo < 0) {
    return res.status(400).json({ ok: false, message: 'El costo debe ser un numero mayor o igual a 0' });
  }

  const nuevo = agregarMantenimiento(motoId, body.descripcion.trim(), body.costo);
  res.status(201).json({ ok: true, data: nuevo });
}
