const playersService = require("../services/players.service");

async function getPlayers(req, res) {
  try {
    const players = await playersService.getAllPlayers();

    res.status(200).json({
      ok: true,
      message: "Jugadores obtenidos correctamente",
      total: players.length,
      data: players
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener los jugadores"
    });
  }
}

async function getPlayerById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID debe ser un numero entero positivo"
      });
    }

    const player = await playersService.getPlayerById(id);

    if (!player) {
      return res.status(404).json({
        ok: false,
        message: "Jugador no encontrado"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Jugador encontrado correctamente",
      data: player
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al buscar el jugador"
    });
  }
}

async function getPlayersByCountry(req, res) {
  try {
    const { country } = req.params;

    if (!country || !country.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El pais es obligatorio"
      });
    }

    const players =
      await playersService.getPlayersByCountry(country);

    if (players.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron jugadores de ese pais"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Jugadores encontrados correctamente",
      total: players.length,
      data: players
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al buscar jugadores por pais"
    });
  }
}

module.exports = {
  getPlayers,
  getPlayerById,
  getPlayersByCountry
};