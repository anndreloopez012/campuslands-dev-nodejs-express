import {
  getAllPlayersService,
  getPlayerByIdService,
  getPlayerStatsService,
  createPlayerService
} from "../services/pingpong.service.js";

export const getPlayersController = async (req, res) => {
  try {
    const players = await getAllPlayersService();
    return res.status(200).json({
      status: "success",
      total: players.length,
      data: players
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error asíncrono al consultar la lista de jugadores."
    });
  }
};

export const getPlayerByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await getPlayerByIdService(id);

    if (!player) {
      return res.status(404).json({
        status: "error",
        message: `Jugador con ID '${id}' no encontrado.`
      });
    }

    return res.status(200).json({
      status: "success",
      data: player
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error asíncrono al obtener los detalles del jugador."
    });
  }
};

export const getPlayerStatsController = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await getPlayerStatsService(id);

    if (!stats) {
      return res.status(404).json({
        status: "error",
        message: `No se encontraron estadísticas para el jugador con ID '${id}'.`
      });
    }

    return res.status(200).json({
      status: "success",
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error asíncrono al procesar el cálculo de estadísticas."
    });
  }
};

export const createPlayerController = async (req, res) => {
  try {
    const { name, playstyle, rank, matchesWon } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El campo 'name' es obligatorio y debe ser un texto válido."
      });
    }

    if (!playstyle || typeof playstyle !== "string" || playstyle.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El campo 'playstyle' es obligatorio y debe ser un texto válido."
      });
    }

    if (rank === undefined || isNaN(Number(rank))) {
      return res.status(400).json({
        status: "error",
        message: "El campo 'rank' es obligatorio y debe ser un número válido."
      });
    }

    const newPlayer = await createPlayerService({
      name: name.trim(),
      playstyle: playstyle.trim(),
      rank,
      matchesWon
    });

    return res.status(201).json({
      status: "success",
      data: newPlayer
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error asíncrono al guardar el nuevo jugador."
    });
  }
};