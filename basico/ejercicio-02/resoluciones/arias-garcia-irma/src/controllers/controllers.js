
import * as playerService from '../services/player.service.js';

// Endpoint de verificación (Health check requerido)
export const getHealth = (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "npm scripts y package.json"
  });
};

// Listar jugadores del shooter
export const listPlayers = (req, res) => {
  try {
    const players = playerService.getAllPlayers();
    res.status(200).json({
      ok: true,
      total: players.length,
      data: players
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener los jugadores",
      error: error.message
    });
  }
};

// Registrar un nuevo jugador
export const registerPlayer = (req, res) => {
  try {
    const { tag, rank, kda, mainWeapon } = req.body;

    if (!tag || !rank) {
      return res.status(400).json({
        ok: false,
        message: "Los campos 'tag' y 'rank' son obligatorios."
      });
    }

    const createdPlayer = playerService.createPlayer({ 
      tag, 
      rank, 
      kda: kda || "1.0", 
      mainWeapon: mainWeapon || "Desconocida" 
    });

    res.status(201).json({
      ok: true,
      message: "Jugador registrado exitosamente en el roster",
      data: createdPlayer
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error interno al registrar el jugador",
      error: error.message
    });
  }
};