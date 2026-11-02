import { getMatchStats } from '../services/service.js';

export const getStats = (req, res) => {
  try {
    const { mode } = req.query;
    const result = getMatchStats(mode);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: "Error en la solicitud de estadísticas",
      error: error.message
    });
  }
};