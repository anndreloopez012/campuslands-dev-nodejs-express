import { getTeamsFromFileService } from "../services/tournament.service.js";

export const getTeamsController = async (req, res) => {
  try {
    const { category } = req.query;
    const teams = await getTeamsFromFileService(category);

    return res.status(200).json({
      status: "success",
      total: teams.length,
      data: teams
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al leer el archivo de datos del torneo."
    });
  }
};