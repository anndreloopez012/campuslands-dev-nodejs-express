const {
  getAllModels,
  findModelById,
  addModel
} = require("../services/model.service");

const getModels = (req, res) => {
  const models = getAllModels();

  res.status(200).json({
    ok: true,
    data: models
  });
};

const getModelById = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const model = findModelById(id);

  if (!model) {
    return res.status(404).json({
      ok: false,
      message: "Modelo arquitectónico no encontrado"
    });
  }

  return res.status(200).json({
    ok: true,
    data: model
  });
};

const createModel = (req, res) => {
  const { name, software, type } = req.body;

  if (!name || !software || !type) {
    return res.status(400).json({
      ok: false,
      message: "name, software y type son obligatorios"
    });
  }

  const newModel = addModel({
    name,
    software,
    type
  });

  return res.status(201).json({
    ok: true,
    message: "Modelo arquitectónico creado correctamente",
    data: newModel
  });
};

module.exports = {
  getModels,
  getModelById,
  createModel
};