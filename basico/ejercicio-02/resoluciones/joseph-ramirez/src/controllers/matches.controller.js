const matchesService = require("../services/matches.service");

const getMatches = (req, res) => {
  try {
    const matches = matchesService.getMatches();

    return res.status(200).json({
      ok: true,
      message: "Partidas obtenidas correctamente",
      topic: "npm scripts y package.json",
      data: matches
    });
  } catch (error) {
    console.error("Error al obtener las partidas:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor"
    });
  }
};

module.exports = {
  getMatches
};