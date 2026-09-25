const carsService = require("../services/cars.service");

function getCars(req, res) {
  const cars = carsService.getCars();

  res.status(200).json({
    ok: true,
    message: "Autos obtenidos correctamente",
    total: cars.length,
    data: cars
  });
}

function getCarsByBrand(req, res) {
  const { brand } = req.params;

  if (!brand || !brand.trim()) {
    return res.status(400).json({
      ok: false,
      message: "La marca es obligatoria"
    });
  }

  const cars = carsService.findCarsByBrand(brand);

  if (cars.length === 0) {
    return res.status(404).json({
      ok: false,
      message: "No se encontraron autos de esa marca"
    });
  }

  res.status(200).json({
    ok: true,
    message: "Autos encontrados correctamente",
    total: cars.length,
    data: cars
  });
}

module.exports = {
  getCars,
  getCarsByBrand
};