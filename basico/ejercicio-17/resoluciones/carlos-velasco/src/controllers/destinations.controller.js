const destinationsService = require("../services/destinations.service");

function getDestinations(req, res) {
  const { country } = req.query;

  const destinations = destinationsService.getAllDestinations(country);

  res.status(200).json({
    ok: true,
    count: destinations.length,
    data: destinations
  });
}

function getDestinationById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const destination = destinationsService.getDestinationById(id);

  if (!destination) {
    return res.status(404).json({
      ok: false,
      message: "Destino turístico no encontrado"
    });
  }

  res.status(200).json({
    ok: true,
    data: destination
  });
}

module.exports = {
  getDestinations,
  getDestinationById
};