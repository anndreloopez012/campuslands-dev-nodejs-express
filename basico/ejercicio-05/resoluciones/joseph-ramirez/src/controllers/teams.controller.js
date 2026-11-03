const teamsService = require("../services/teams.service");

async function getTeams(req, res) {
  try {
    const teams = await teamsService.getTeams();

    res.status(200).json({
      ok: true,
      message: "Equipos obtenidos correctamente",
      total: teams.length,
      data: teams
    });
  } catch (error) {
    console.error("Error al leer los equipos:", error.message);

    res.status(500).json({
      ok: false,
      message: "No fue posible leer el archivo de equipos"
    });
  }
}

module.exports = {
  getTeams
};