import { getHeroStatus } from '../services/service.js';

export const getStatus = (req, res) => {
  try {
    const result = getHeroStatus();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};