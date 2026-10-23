const tattooService = require("../services/tattoo.service");

const getTattoos = (req, res) => {
  const { style, size } = req.query;

  const result = tattooService.findTattoos({ style, size });

  res.status(200).json({
    ok: true,
    count: result.length,
    data: result
  });
};

const getTattooById = (req, res) => {
  const { id } = req.params;

  const tattooId = Number(id);

  if (!Number.isInteger(tattooId) || tattooId <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El parámetro id debe ser un número entero positivo"
    });
  }

  const tattoo = tattooService.findTattooById(tattooId);

  if (!tattoo) {
    return res.status(404).json({
      ok: false,
      message: "Tatuaje no encontrado"
    });
  }

  return res.status(200).json({
    ok: true,
    data: tattoo
  });
};

module.exports = {
  getTattoos,
  getTattooById
};