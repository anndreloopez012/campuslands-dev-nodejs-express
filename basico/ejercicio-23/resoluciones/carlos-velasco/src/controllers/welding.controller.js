const {
  getAllWeldings,
  findWeldingById,
  addWelding,
  removeWelding
} = require("../services/welding.service");

const getWeldings = (req, res) => {
  const weldings = getAllWeldings();

  return res.status(200).json({
    ok: true,
    data: weldings
  });
};

const getWeldingById = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const welding = findWeldingById(id);

  if (!welding) {
    return res.status(404).json({
      ok: false,
      message: "Trabajo de soldadura no encontrado"
    });
  }

  return res.status(200).json({
    ok: true,
    data: welding
  });
};

const createWelding = (req, res) => {
  const { project, technique, material } = req.body;

  if (!project || !technique || !material) {
    return res.status(400).json({
      ok: false,
      message: "project, technique y material son obligatorios"
    });
  }

  const welding = addWelding({
    project,
    technique,
    material
  });

  return res.status(201).json({
    ok: true,
    message: "Trabajo de soldadura creado correctamente",
    data: welding
  });
};

const deleteWelding = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const removedWelding = removeWelding(id);

  if (!removedWelding) {
    return res.status(404).json({
      ok: false,
      message: "Trabajo de soldadura no encontrado"
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Trabajo de soldadura eliminado correctamente",
    data: removedWelding
  });
};

module.exports = {
  getWeldings,
  getWeldingById,
  createWelding,
  deleteWelding
};