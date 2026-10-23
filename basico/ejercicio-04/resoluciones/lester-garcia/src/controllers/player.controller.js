import {
  getAllPlayersService,
  getAlivePlayersService,
  createPlayerService
} from "../services/player.service.js";

export const getPlayersController = (req, res) => {
  const { status } = req.query;

  if (status === "alive") {
    const alivePlayers = getAlivePlayersService();
    return res.status(200).json({ status: "success", data: alivePlayers });
  }

  const players = getAllPlayersService();
  return res.status(200).json({ status: "success", data: players });
};

export const createPlayerController = (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "El campo 'username' es obligatorio y debe ser un texto válido."
    });
  }

  const newPlayer = createPlayerService({ username: username.trim() });
  return res.status(201).json({ status: "success", data: newPlayer });
};