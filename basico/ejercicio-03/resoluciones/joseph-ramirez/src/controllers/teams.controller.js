const teamsService = require("../services/teams.service");
const response = require("../utils/response");

const getTeams = (req, res) => {
  try {
    const teams = teamsService.getTeams();

    return response.success(res, {
      message: "Equipos obtenidos correctamente",
      topic: "modulos CommonJS",
      data: teams
    });
  } catch (error) {
    console.error("Error al obtener los equipos:", error.message);

    return response.error(res, "Error interno del servidor");
  }
};

module.exports = {
  getTeams
};