import {
  listarFormulas,
  buscarFormula,
  crearFormula,
  actualizarFormula,
  eliminarFormula
} from '../services/formulas.service.js';

export function listar(req, res) {
  res.json({
    ok: true,
    formulas: listarFormulas()
  });
}

export function obtener(req, res) {
  const formula = buscarFormula(req.params.id);

  if (!formula) {
    return res.status(404).json({
      ok: false,
      message: 'Formula no encontrada'
    });
  }

  res.json({
    ok: true,
    formula
  });
}

export function crear(req, res) {
  const { nombre, formula } = req.body;

  if (!nombre || !formula) {
    return res.status(400).json({
      ok: false,
      message: 'El nombre y la formula son obligatorios'
    });
  }

  const nuevaFormula = crearFormula(nombre, formula);

  res.status(201).json({
    ok: true,
    formula: nuevaFormula
  });
}

export function actualizar(req, res) {
  const { nombre, formula } = req.body;

  if (!nombre || !formula) {
    return res.status(400).json({
      ok: false,
      message: 'El nombre y la formula son obligatorios'
    });
  }

  const resultado = actualizarFormula(
    req.params.id,
    nombre,
    formula
  );

  if (!resultado) {
    return res.status(404).json({
      ok: false,
      message: 'Formula no encontrada'
    });
  }

  res.json({
    ok: true,
    formula: resultado
  });
}

export function eliminar(req, res) {
  const resultado = eliminarFormula(req.params.id);

  if (!resultado) {
    return res.status(404).json({
      ok: false,
      message: 'Formula no encontrada'
    });
  }

  res.json({
    ok: true,
    message: 'Formula eliminada correctamente'
  });
}