import { matchmakingService } from '../services/matchmaking.service.js';

export const getHealth = (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'mock de dependencias'
  });
};

export const postJoinQueue = async (req, res) => {
  try {
    const result = await matchmakingService.queuePlayer(req.body);
    return res.status(200).json({
      ok: true,
      message: 'Jugador validado e ingresado a la cola',
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
