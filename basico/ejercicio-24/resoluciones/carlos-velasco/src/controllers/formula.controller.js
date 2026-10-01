const formulaService = require("../services/formula.service");

function getAllFormulas(req, res) {
  const formulas = formulaService.getAll();

  return res.status(200).json({
    ok: true,
    data: formulas
  });
}

function getFormulaById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const formula = formulaService.getById(id);

  if (!formula) {
    return res.status(404).json({
      ok: false,
      message: "Fórmula química no encontrada"
    });
  }

  return res.status(200).json({
    ok: true,
    data: formula
  });
}

function createFormula(req, res) {
  const { name, formula, description } = req.body;

  if (!name || !formula || !description) {
    return res.status(400).json({
      ok: false,
      message: "Los campos name, formula y description son obligatorios"
    });
  }

  if (
    typeof name !== "string" ||
    typeof formula !== "string" ||
    typeof description !== "string"
  ) {
    return res.status(400).json({
      ok: false,
      message: "Los campos deben ser de tipo texto"
    });
  }

  const newFormula = formulaService.create({
    name: name.trim(),
    formula: formula.trim(),
    description: description.trim()
  });

  return res.status(201).json({
    ok: true,
    message: "Fórmula química creada correctamente",
    data: newFormula
  });
}

function updateFormula(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const { name, formula, description } = req.body;

  if (!name || !formula || !description) {
    return res.status(400).json({
      ok: false,
      message: "Los campos name, formula y description son obligatorios"
    });
  }

  if (
    typeof name !== "string" ||
    typeof formula !== "string" ||
    typeof description !== "string"
  ) {
    return res.status(400).json({
      ok: false,
      message: "Los campos deben ser de tipo texto"
    });
  }

  const updatedFormula = formulaService.update(id, {
    name: name.trim(),
    formula: formula.trim(),
    description: description.trim()
  });

  if (!updatedFormula) {
    return res.status(404).json({
      ok: false,
      message: "Fórmula química no encontrada"
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Fórmula química actualizada correctamente",
    data: updatedFormula
  });
}

function deleteFormula(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const deletedFormula = formulaService.remove(id);

  if (!deletedFormula) {
    return res.status(404).json({
      ok: false,
      message: "Fórmula química no encontrada"
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Fórmula química eliminada correctamente",
    data: deletedFormula
  });
}

module.exports = {
  getAllFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula
};