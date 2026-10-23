const motorcyclesService = require("../services/motorcycles.service");

async function getMotorcycles(req, res) {
  try {
    const motorcycles = await motorcyclesService.getMotorcycles();

    res.status(200).json({
      ok: true,
      message: "Motos obtenidas correctamente",
      total: motorcycles.length,
      data: motorcycles
    });
  } catch (error) {
    console.error("Error al obtener las motos:", error.message);

    res.status(500).json({
      ok: false,
      message: "No fue posible obtener las motos"
    });
  }
}

async function getMotorcycleFicha(req, res) {
  try {
    const { fileName } = req.params;

    const ficha = await motorcyclesService.getMotorcycleFicha(fileName);

    res.status(200).json({
      ok: true,
      message: "Ficha tecnica obtenida correctamente",
      data: ficha
    });
  } catch (error) {
    console.error("Error al obtener la ficha:", error.message);

    const statusCode = error.statusCode || 404;

    res.status(statusCode).json({
      ok: false,
      message: error.statusCode
        ? error.message
        : "No fue posible encontrar la ficha tecnica"
    });
  }
}

module.exports = {
  getMotorcycles,
  getMotorcycleFicha
};