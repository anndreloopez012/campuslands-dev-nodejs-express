import {
  getGameStatus,
  validatePlayer
} from '../services/game.service.js';

export function getHealth(req, res) {
  const result = getGameStatus();

  res.status(200).json(result);
}

export function createPlayer(req, res) {
  const { player } = req.body;

  if (!validatePlayer(player)) {
    return res.status(400).json({
      ok: false,
      message: 'El campo player es obligatorio'
    });
  }

  res.status(201).json({
    ok: true,
    message: 'Jugador registrado correctamente',
    player
  });
}