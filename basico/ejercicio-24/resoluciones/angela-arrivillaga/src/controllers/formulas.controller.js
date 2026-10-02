import { getFormulas, buscarFormula, validarFormula, crearFormula, actualizarFormula, eliminarFormula } from '../services/formulas.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'CRUD basico'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getFormulas() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);
  const formula = buscarFormula(id);

  if (!formula) {
    return res.status(404).json({ ok: false, message: 'Formula no encontrada' });
  }

  res.json({ ok: true, data: formula });
}

export function crear(req, res) {
  const datos = req.body || {};
  const errores = validarFormula(datos);

  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores: errores });
  }

  const nueva = crearFormula(datos);
  res.status(201).json({ ok: true, data: nueva });
}

export function actualizar(req, res) {
  const id = Number(req.params.id);
  const datos = req.body || {};

  if (!buscarFormula(id)) {
    return res.status(404).json({ ok: false, message: 'Formula no encontrada' });
  }

  const errores = validarFormula(datos);

  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores: errores });
  }

  const actualizada = actualizarFormula(id, datos);
  res.json({ ok: true, data: actualizada });
}

export function eliminar(req, res) {
  const id = Number(req.params.id);
  const eliminada = eliminarFormula(id);

  if (!eliminada) {
    return res.status(404).json({ ok: false, message: 'Formula no encontrada' });
  }

  res.json({ ok: true, message: 'Formula eliminada', data: eliminada });
}
