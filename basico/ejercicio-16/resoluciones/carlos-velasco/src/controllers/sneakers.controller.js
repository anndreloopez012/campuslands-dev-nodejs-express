const sneakersService = require('../services/sneakers.service');

const getSneakers = (req, res) => {
  const sneakers = sneakersService.getSneakers();

  res.status(200).json({
    ok: true,
    message: 'Sneakers obtenidos correctamente',
    data: sneakers
  });
};

const getSneakerById = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: 'El id debe ser un número entero positivo'
    });
  }

  const sneaker = sneakersService.getSneakerById(id);

  if (!sneaker) {
    return res.status(404).json({
      ok: false,
      message: 'Sneaker no encontrado'
    });
  }

  return res.status(200).json({
    ok: true,
    message: 'Sneaker obtenido correctamente',
    data: sneaker
  });
};

module.exports = {
  getSneakers,
  getSneakerById
};