const {
    getAllPlayers,
    getPlayerById
  } = require("../services/players.service");
  
  function getPlayers(req, res) {
    const players = getAllPlayers();
  
    return res.status(200).json({
      ok: true,
      data: players
    });
  }
  
  function getPlayer(req, res) {
    const id = Number(req.params.id);
  
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "El ID debe ser un numero entero positivo"
      });
    }
  
    const player = getPlayerById(id);
  
    if (!player) {
      return res.status(404).json({
        ok: false,
        status: 404,
        message: "Jugador no encontrado"
      });
    }
  
    return res.status(200).json({
      ok: true,
      data: player
    });
  }
  
  module.exports = {
    getPlayers,
    getPlayer
  };